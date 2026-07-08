import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DIRECT client→vendor payments via Paystack subaccounts + split.
 *
 * Model (see PLANOVAR_PAYSTACK_DIRECTPAY_SPIKE.md): each vendor is a subaccount
 * with `percentage_charge: 0`, so the vendor receives 100% and Planovar takes
 * nothing. `bearer: 'subaccount'` makes the vendor's side carry the Paystack fee;
 * we gross-up the charge so the client visibly pays it and the vendor still nets
 * the milestone amount. Paystack settles the subaccount's share directly to the
 * vendor's bank (T+1) — the platform never holds funds.
 */
@Injectable()
export class PaystackDirectPayService {
  private readonly base = 'https://api.paystack.co';
  private readonly logger = new Logger(PaystackDirectPayService.name);

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private get secret(): string {
    return this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY');
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.secret}`,
      'Content-Type': 'application/json',
    };
  }

  // ── Fees (NGN local pricing, all maths in kobo) ───────────────────────────

  /** Paystack fee (kobo) for a given CHARGE amount (kobo): 1.5% + ₦100
   *  (₦100 waived under ₦2,500), capped at ₦2,000, then +7.5% VAT on the fee. */
  feeForCharge(chargeKobo: number): number {
    let fee = Math.ceil(chargeKobo * 0.015);
    if (chargeKobo >= 250_000) fee += 10_000; // +₦100 flat for ≥ ₦2,500
    if (fee > 200_000) fee = 200_000; // cap ₦2,000
    fee += Math.ceil(fee * 0.075); // 7.5% VAT on the fee
    return fee;
  }

  /** Gross-up so the vendor nets `netKobo` after the fee is deducted from their
   *  side (bearer = subaccount). The fee depends on the charge, so iterate. */
  grossUp(netKobo: number): { chargeKobo: number; feeKobo: number } {
    let charge = netKobo;
    for (let i = 0; i < 6; i++) charge = netKobo + this.feeForCharge(charge);
    return { chargeKobo: charge, feeKobo: charge - netKobo };
  }

  // ── Bank account setup (list · resolve · save) ────────────────────────────

  /** Nigerian banks (name + code) for the vendor's picker. */
  async listBanks(): Promise<{ name: string; code: string }[]> {
    const res = await fetch(`${this.base}/bank?currency=NGN&perPage=100`, {
      headers: this.headers(),
    });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok || !data?.status) {
      throw new ServiceUnavailableException('Could not load banks');
    }
    return (data.data as any[]).map((b) => ({ name: b.name, code: b.code }));
  }

  /** Verify an account number against a bank → the registered account name. */
  async resolveAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<{ accountName: string }> {
    const res = await fetch(
      `${this.base}/bank/resolve?account_number=${encodeURIComponent(
        accountNumber,
      )}&bank_code=${encodeURIComponent(bankCode)}`,
      { headers: this.headers() },
    );
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok || !data?.status) {
      throw new BadRequestException(
        data?.message ?? 'Could not verify this account — check the details',
      );
    }
    return { accountName: data.data.account_name as string };
  }

  /** Save the vendor's bank account and (re)create their 0%-cut subaccount. */
  async saveVendorBankAccount(
    userId: string,
    dto: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    },
  ) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    await this.prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: {
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        bankAccount: dto.accountNumber,
        accountName: dto.accountName,
        paystackSubaccountCode: null, // force a fresh subaccount for the new bank
      },
    });
    await this.ensureSubaccount(vendor.id);
    return this.getVendorBankAccount(userId);
  }

  /** The vendor's saved bank account (null if none). */
  async getVendorBankAccount(userId: string) {
    const v = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: {
        bankCode: true,
        bankName: true,
        bankAccount: true,
        accountName: true,
        paystackSubaccountCode: true,
      },
    });
    if (!v?.bankAccount) return null;
    return {
      bankCode: v.bankCode,
      bankName: v.bankName,
      accountNumber: v.bankAccount,
      accountName: v.accountName,
      active: !!v.paystackSubaccountCode,
    };
  }

  // ── Subaccount ────────────────────────────────────────────────────────────

  /** Ensure the vendor has a Paystack subaccount (percentage_charge = 0) and
   *  return its code. Requires the vendor's bank details to be on file. */
  async ensureSubaccount(vendorId: string): Promise<string> {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        businessName: true,
        bankCode: true,
        bankAccount: true,
        paystackSubaccountCode: true,
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.paystackSubaccountCode) return vendor.paystackSubaccountCode;
    if (!vendor.bankCode || !vendor.bankAccount) {
      throw new BadRequestException(
        'Vendor must add bank details before they can receive payments',
      );
    }

    const res = await fetch(`${this.base}/subaccount`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        business_name: vendor.businessName,
        settlement_bank: vendor.bankCode,
        account_number: vendor.bankAccount,
        percentage_charge: 0, // platform takes 0% — vendor receives 100%
      }),
    });
    const data = (await res.json().catch(() => null)) as any;
    const code = data?.data?.subaccount_code as string | undefined;
    if (!res.ok || !code) {
      this.logger.error(
        `Paystack subaccount create failed (${res.status}): ${JSON.stringify(data ?? {})}`,
      );
      throw new ServiceUnavailableException(
        `Could not set up vendor payouts: ${data?.message ?? `HTTP ${res.status}`}`,
      );
    }

    await this.prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: { paystackSubaccountCode: code },
    });
    return code;
  }

  // ── Charge + verify ───────────────────────────────────────────────────────

  /** Initialize a split charge routed to the vendor's subaccount. The client
   *  bears the fee (bearer: subaccount + grossed-up amount). Returns the
   *  Paystack checkout URL. */
  async initSplitCharge(input: {
    email: string;
    amountKobo: number;
    subaccountCode: string;
    reference: string;
    metadata?: Record<string, unknown>;
    callbackUrl?: string;
  }): Promise<{ authorizationUrl: string; reference: string }> {
    const res = await fetch(`${this.base}/transaction/initialize`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        subaccount: input.subaccountCode,
        bearer: 'subaccount',
        reference: input.reference,
        ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
        metadata: input.metadata ?? {},
      }),
    });
    const data = (await res.json().catch(() => null)) as any;
    const url = data?.data?.authorization_url as string | undefined;
    if (!res.ok || !url) {
      this.logger.error(
        `Paystack init split charge failed (${res.status}): ${JSON.stringify(data ?? {})}`,
      );
      throw new ServiceUnavailableException(
        `Payment could not be started: ${data?.message ?? `HTTP ${res.status}`}`,
      );
    }
    return { authorizationUrl: url, reference: input.reference };
  }

  /** Verify a charge by reference. */
  async verify(
    reference: string,
  ): Promise<{ status: 'success' | 'failed' | 'pending'; raw: any }> {
    try {
      const res = await fetch(
        `${this.base}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: this.headers() },
      );
      const data = (await res.json().catch(() => null)) as any;
      const status = data?.data?.status as string | undefined;
      if (status === 'success') return { status: 'success', raw: data.data };
      if (status === 'failed' || status === 'abandoned') {
        return { status: 'failed', raw: data?.data };
      }
      return { status: 'pending', raw: data?.data };
    } catch (err) {
      this.logger.error(`Paystack verify threw: ${err}`);
      return { status: 'pending', raw: null };
    }
  }
}
