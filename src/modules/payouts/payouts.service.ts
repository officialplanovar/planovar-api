import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayoutStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';

@Injectable()
export class PayoutsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  private get paystackSecret(): string {
    return this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY');
  }

  private paystackHeaders() {
    return {
      Authorization: `Bearer ${this.paystackSecret}`,
      'Content-Type': 'application/json',
    };
  }

  // ─── Vendor: list own payouts ─────────────────────────────────────────────

  async listForVendor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');

    return this.prisma.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        scheduledAt: true,
        processedAt: true,
        paystackTransferCode: true,
        failureReason: true,
        createdAt: true,
        _count: { select: { lineItems: true } },
      },
    });
  }

  // ─── Vendor: get single payout ────────────────────────────────────────────

  async getOne(payoutId: string, userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      select: {
        id: true,
        vendorId: true,
        amount: true,
        status: true,
        scheduledAt: true,
        processedAt: true,
        paystackTransferCode: true,
        failureReason: true,
        createdAt: true,
        lineItems: {
          select: {
            id: true,
            amount: true,
            commissionRate: true,
            transaction: {
              select: {
                id: true,
                amount: true,
                paystackReference: true,
              },
            },
          },
        },
      },
    });

    if (!payout) throw new NotFoundException('Payout not found');

    if (payout.vendorId !== vendor.id) {
      throw new UnauthorizedException('You do not own this payout');
    }

    return payout;
  }

  // ─── Admin: list pending payouts ──────────────────────────────────────────

  async listPending() {
    return this.prisma.payout.findMany({
      where: { status: PayoutStatus.PENDING },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        amount: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            bankCode: true,
            bankAccount: true,
            paystackRecipientCode: true,
            user: { select: { id: true, email: true, name: true } },
          },
        },
        _count: { select: { lineItems: true } },
      },
    });
  }

  // ─── Admin: process (trigger transfer) ───────────────────────────────────

  async processPayout(payoutId: string): Promise<string> {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      select: {
        id: true,
        amount: true,
        status: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            bankCode: true,
            bankAccount: true,
            paystackRecipientCode: true,
          },
        },
      },
    });

    if (!payout) throw new NotFoundException('Payout not found');

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(`Payout is already ${payout.status}`);
    }

    const { vendor } = payout;

    if (!vendor.bankCode || !vendor.bankAccount) {
      throw new BadRequestException('Vendor has not configured bank account details');
    }

    try {
      // Ensure recipient code exists — create if missing
      let recipientCode = vendor.paystackRecipientCode;

      if (!recipientCode) {
        const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: this.paystackHeaders(),
          body: JSON.stringify({
            type: 'nuban',
            name: vendor.businessName,
            account_number: vendor.bankAccount,
            bank_code: vendor.bankCode,
            currency: 'NGN',
          }),
        });

        const recipientData = await recipientRes.json() as any;

        if (!recipientData.status) {
          throw new BadRequestException(
            `Failed to create Paystack recipient: ${recipientData.message}`,
          );
        }

        recipientCode = recipientData.data.recipient_code as string;

        await this.prisma.vendorProfile.update({
          where: { id: vendor.id },
          data: { paystackRecipientCode: recipientCode },
        });
      }

      // Amount in kobo (Paystack expects smallest currency unit)
      const amountInKobo = Math.round(Number(payout.amount) * 100);

      const transferRes = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: this.paystackHeaders(),
        body: JSON.stringify({
          source: 'balance',
          amount: amountInKobo,
          recipient: recipientCode,
          reason: 'Planovar vendor payout',
        }),
      });

      const transferData = await transferRes.json() as any;

      if (!transferData.status) {
        throw new BadRequestException(
          `Paystack transfer failed: ${transferData.message}`,
        );
      }

      const transferCode: string = transferData.data.transfer_code;

      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PROCESSING,
          paystackTransferCode: transferCode,
        },
      });

      return transferCode;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;

      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: err instanceof Error ? err.message : 'Unknown error',
        },
      });

      throw new InternalServerErrorException('Payout processing failed');
    }
  }

  // ─── Vendor: update bank details ──────────────────────────────────────────

  async updateBankDetails(userId: string, dto: UpdateBankDetailsDto) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, businessName: true },
    });

    if (!vendor) throw new NotFoundException('Vendor profile not found');

    try {
      const res = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: this.paystackHeaders(),
        body: JSON.stringify({
          type: 'nuban',
          name: dto.accountName,
          account_number: dto.bankAccount,
          bank_code: dto.bankCode,
          currency: 'NGN',
        }),
      });

      const data = await res.json() as any;

      if (!data.status) {
        throw new BadRequestException(
          `Bank verification failed: ${data.message}`,
        );
      }

      const recipientCode: string = data.data.recipient_code;

      const updated = await this.prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: {
          bankCode: dto.bankCode,
          bankAccount: dto.bankAccount,
          paystackRecipientCode: recipientCode,
        },
        select: {
          id: true,
          bankCode: true,
          bankAccount: true,
          paystackRecipientCode: true,
        },
      });

      return updated;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to verify bank account');
    }
  }
}
