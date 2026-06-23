import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  EscrowStatus,
  InstallmentStatus,
  InstallmentType,
  PayoutStatus,
  Prisma,
  Transaction,
  TransactionType,
} from '@prisma/client';
import * as crypto from 'crypto';
import { EmailService } from '../../common/email/email.service';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailService) private readonly email: EmailService,
    @Inject(SubscriptionsService) private readonly subscriptions: SubscriptionsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // INITIATE PAYMENT
  // ─────────────────────────────────────────────────────────────────────────

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const installment = await this.prisma.paymentInstallment.findUnique({
      where: { id: dto.installmentId },
      include: {
        quote: {
          include: {
            booking: {
              include: {
                vendor: { select: { id: true, subscriptionTier: true } },
                client: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!installment) throw new NotFoundException('Installment not found');

    const booking = installment.quote.booking;

    // Only the booking client may pay
    if (booking.clientId !== userId) {
      throw new ForbiddenException('Only the booking client can initiate payment');
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new ConflictException('This installment has already been paid');
    }

    if (
      installment.status !== InstallmentStatus.PENDING &&
      installment.status !== InstallmentStatus.OVERDUE
    ) {
      throw new ConflictException(`Cannot pay an installment with status ${installment.status}`);
    }

    const provider = dto.provider ?? 'paystack';
    const reference = `plnv_${Date.now()}_${dto.installmentId.slice(0, 8)}`;
    const amountInKobo = Math.round(installment.amount.toNumber() * 100);
    const clientEmail = booking.client.email;

    // Create a pending transaction record first
    const transaction = await this.prisma.transaction.create({
      data: {
        bookingId: booking.id,
        installmentId: dto.installmentId,
        userId,
        type: TransactionType.PAYMENT,
        amount: installment.amount,
        currency: 'NGN',
        ...(provider === 'paystack'
          ? { paystackReference: reference, paystackStatus: 'pending' }
          : { flutterwaveReference: reference }),
        metadata: {
          installmentId: dto.installmentId,
          bookingId: booking.id,
          provider,
        },
      },
    });

    if (provider === 'paystack') {
      const paystackSecretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
      const payload: Record<string, unknown> = {
        email: clientEmail,
        amount: amountInKobo,
        reference,
        metadata: {
          installmentId: dto.installmentId,
          bookingId: booking.id,
          transactionId: transaction.id,
        },
      };
      if (dto.callbackUrl) payload.callback_url = dto.callbackUrl;

      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Paystack init failed: ${err}`);
        // Clean up the dangling transaction
        await this.prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => null);
        throw new ConflictException('Payment provider error — please try again');
      }

      const data = (await res.json()) as { data: { authorization_url: string; reference: string } };
      return {
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
        transactionId: transaction.id,
      };
    }

    // Flutterwave
    const flwSecretKey = this.config.get<string>('FLUTTERWAVE_SECRET_KEY');
    const flwPayload = {
      tx_ref: reference,
      amount: installment.amount.toNumber(),
      currency: 'NGN',
      redirect_url: dto.callbackUrl ?? this.config.get<string>('PAYMENT_REDIRECT_URL', 'https://planovar.com/payment/callback'),
      customer: {
        email: clientEmail,
        name: booking.client.name ?? 'Customer',
      },
      meta: {
        installmentId: dto.installmentId,
        bookingId: booking.id,
        transactionId: transaction.id,
      },
    };

    const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flwSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flwPayload),
    });

    if (!flwRes.ok) {
      const err = await flwRes.text();
      this.logger.error(`Flutterwave init failed: ${err}`);
      await this.prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => null);
      throw new ConflictException('Payment provider error — please try again');
    }

    const flwData = (await flwRes.json()) as { data: { link: string } };
    return {
      authorizationUrl: flwData.data.link,
      reference,
      transactionId: transaction.id,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFY PAYMENT
  // ─────────────────────────────────────────────────────────────────────────

  async verifyPayment(dto: VerifyPaymentDto) {
    const provider = dto.provider ?? 'paystack';

    if (provider === 'paystack') {
      const paystackSecretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(dto.reference)}`, {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      });
      if (!res.ok) throw new NotFoundException('Transaction not found on Paystack');
      const data = (await res.json()) as { data: { status: string; amount: number; currency: string } };
      return { provider: 'paystack', status: data.data.status, data: data.data };
    }

    // Flutterwave — verify by tx_ref
    const flwSecretKey = this.config.get<string>('FLUTTERWAVE_SECRET_KEY');
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(dto.reference)}`,
      { headers: { Authorization: `Bearer ${flwSecretKey}` } },
    );
    if (!res.ok) throw new NotFoundException('Transaction not found on Flutterwave');
    const data = (await res.json()) as { data: { status: string; amount: number; currency: string } };
    return { provider: 'flutterwave', status: data.data.status, data: data.data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PAYSTACK WEBHOOK
  // ─────────────────────────────────────────────────────────────────────────

  async handlePaystackWebhook(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY', '');
    const expectedSig = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (expectedSig !== signature) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }

    let event: { event: string; data: Record<string, unknown> };
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      this.logger.error('Failed to parse Paystack webhook body', err);
      return;
    }

    // Route subscription lifecycle events to the subscriptions service
    const SUBSCRIPTION_EVENTS = new Set([
      'subscription.create',
      'invoice.update',
      'invoice.payment_failed',
      'subscription.disable',
      'subscription.not_renew',
    ]);
    if (SUBSCRIPTION_EVENTS.has(event.event)) {
      await this.subscriptions.handleSubscriptionWebhook(event as any);
      return;
    }

    if (event.event !== 'charge.success') return;

    const reference = event.data.reference as string | undefined;
    if (!reference) return;

    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { paystackReference: reference },
      });

      if (!transaction) {
        this.logger.warn(`Paystack webhook: no transaction found for reference ${reference}`);
        return;
      }

      // Idempotency — skip if already processed
      if (transaction.paystackStatus === 'success') {
        this.logger.log(`Paystack webhook: transaction ${transaction.id} already processed`);
        return;
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { paystackStatus: 'success' },
      });

      await this.processSuccessfulPayment(transaction);
    } catch (err) {
      this.logger.error(`Paystack webhook processing error for reference ${reference}`, err);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLUTTERWAVE WEBHOOK
  // ─────────────────────────────────────────────────────────────────────────

  async handleFlutterwaveWebhook(rawBody: Buffer, signature: string) {
    const expectedHash = this.config.get<string>('FLUTTERWAVE_SECRET_HASH', '');

    if (signature !== expectedHash) {
      throw new UnauthorizedException('Invalid Flutterwave webhook signature');
    }

    let event: { event: string; data: { tx_ref?: string; flw_ref?: string; status: string } };
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      this.logger.error('Failed to parse Flutterwave webhook body', err);
      return;
    }

    if (event.event !== 'charge.completed') return;
    if (event.data.status !== 'successful') return;

    const txRef = event.data.tx_ref;
    if (!txRef) return;

    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { flutterwaveReference: txRef },
      });

      if (!transaction) {
        this.logger.warn(`Flutterwave webhook: no transaction found for tx_ref ${txRef}`);
        return;
      }

      // Idempotency — flutterwave transactions don't have a paystackStatus field,
      // so we use metadata to track processing state
      const meta = transaction.metadata as Record<string, unknown> | null;
      if (meta?.flwProcessed === true) {
        this.logger.log(`Flutterwave webhook: transaction ${transaction.id} already processed`);
        return;
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { metadata: { ...(meta ?? {}), flwProcessed: true } },
      });

      await this.processSuccessfulPayment(transaction);
    } catch (err) {
      this.logger.error(`Flutterwave webhook processing error for tx_ref ${txRef}`, err);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROCESS SUCCESSFUL PAYMENT (private)
  // ─────────────────────────────────────────────────────────────────────────

  private async processSuccessfulPayment(transaction: Transaction) {
    if (!transaction.installmentId) {
      // Subscription or other non-installment payment — nothing to do here
      this.logger.log(`Transaction ${transaction.id} has no installmentId — skipping installment logic`);
      return;
    }

    const installment = await this.prisma.paymentInstallment.findUnique({
      where: { id: transaction.installmentId },
      include: {
        quote: {
          include: {
            installments: true,
            booking: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    subscriptionTier: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!installment) {
      this.logger.error(`processSuccessfulPayment: installment ${transaction.installmentId} not found`);
      return;
    }

    const booking = installment.quote.booking;
    const vendor = booking.vendor;
    const amount = transaction.amount.toNumber();

    // Mark installment as paid
    await this.prisma.paymentInstallment.update({
      where: { id: installment.id },
      data: {
        status: InstallmentStatus.PAID,
        paidAt: new Date(),
      },
    });

    // Fetch commission rate for vendor's tier
    const commissionConfig = await this.prisma.commissionConfig.findUnique({
      where: { tier: vendor.subscriptionTier },
    });

    const commissionRate = commissionConfig?.rate.toNumber() ?? 0.08; // fallback 8%
    const platformFee = amount * commissionRate;
    const vendorAmount = amount - platformFee;

    if (installment.type === InstallmentType.ESCROW) {
      // Create escrow hold — do NOT schedule payout yet
      await this.prisma.escrowHold.create({
        data: {
          bookingId: booking.id,
          installmentId: installment.id,
          amount: new Prisma.Decimal(amount),
          status: EscrowStatus.HELD,
          heldAt: new Date(),
        },
      });

      this.logger.log(
        `Escrow hold created for installment ${installment.id}, amount: ${amount}`,
      );
    } else {
      // IMMEDIATE — update booking financials and schedule payout in 24h
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          finalAmount: { increment: new Prisma.Decimal(amount) },
          platformFee: { increment: new Prisma.Decimal(platformFee) },
          vendorPayout: { increment: new Prisma.Decimal(vendorAmount) },
        },
      });

      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const payout = await this.prisma.payout.create({
        data: {
          vendorId: vendor.id,
          amount: new Prisma.Decimal(vendorAmount),
          status: PayoutStatus.PENDING,
          scheduledAt,
        },
      });

      // Link payout to transaction via PayoutLineItem
      await this.prisma.payoutLineItem.create({
        data: {
          payoutId: payout.id,
          transactionId: transaction.id,
          amount: new Prisma.Decimal(vendorAmount),
          commissionRate: new Prisma.Decimal(commissionRate),
        },
      });

      this.logger.log(
        `Payout ${payout.id} scheduled for vendor ${vendor.id} at ${scheduledAt.toISOString()}`,
      );
    }

    // Check if all installments for this quote are now PAID
    // Re-fetch installments after our update
    const allInstallments = await this.prisma.paymentInstallment.findMany({
      where: { quoteId: installment.quoteId },
    });

    const allPaid = allInstallments.every((i) => i.status === InstallmentStatus.PAID);

    if (allPaid) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.ACTIVE },
      });
      this.logger.log(`All installments paid — booking ${booking.id} set to ACTIVE`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET INSTALLMENTS FOR BOOKING
  // ─────────────────────────────────────────────────────────────────────────

  async getInstallmentsForBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vendor: { select: { userId: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isClient = booking.clientId === userId;
    const isVendor = booking.vendor.userId === userId;

    if (!isClient && !isVendor) {
      throw new ForbiddenException('You are not a participant of this booking');
    }

    // Get the accepted quote's installments
    const quote = await this.prisma.quote.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!quote) throw new NotFoundException('No quote found for this booking');

    return quote.installments;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RELEASE ESCROW
  // ─────────────────────────────────────────────────────────────────────────

  async releaseEscrow(escrowHoldId: string, userId: string) {
    const escrowHold = await this.prisma.escrowHold.findUnique({
      where: { id: escrowHoldId },
      include: {
        booking: {
          include: {
            vendor: { select: { id: true, subscriptionTier: true } },
          },
        },
      },
    });

    if (!escrowHold) throw new NotFoundException('Escrow hold not found');

    if (escrowHold.status !== EscrowStatus.HELD) {
      throw new ConflictException(`Escrow hold has status ${escrowHold.status} — cannot release`);
    }

    // Only booking client or admin can release escrow
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const isClient = escrowHold.booking.clientId === userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isClient && !isAdmin) {
      throw new ForbiddenException('Only the booking client or an admin can release escrow');
    }

    const vendor = escrowHold.booking.vendor;
    const amount = escrowHold.amount.toNumber();

    // Fetch commission config
    const commissionConfig = await this.prisma.commissionConfig.findUnique({
      where: { tier: vendor.subscriptionTier },
    });
    const commissionRate = commissionConfig?.rate.toNumber() ?? 0.08;
    const platformFee = amount * commissionRate;
    const vendorAmount = amount - platformFee;

    const scheduledAt = new Date();

    const [updatedEscrow, payout] = await this.prisma.$transaction([
      this.prisma.escrowHold.update({
        where: { id: escrowHoldId },
        data: {
          status: EscrowStatus.RELEASED,
          releasedAt: new Date(),
          releasedBy: userId,
          releaseReason: isAdmin ? 'admin_release' : 'client_release',
        },
      }),
      this.prisma.payout.create({
        data: {
          vendorId: vendor.id,
          amount: new Prisma.Decimal(vendorAmount),
          status: PayoutStatus.PENDING,
          scheduledAt,
        },
      }),
    ]);

    // Update booking financials
    await this.prisma.booking.update({
      where: { id: escrowHold.bookingId },
      data: {
        platformFee: { increment: new Prisma.Decimal(platformFee) },
        vendorPayout: { increment: new Prisma.Decimal(vendorAmount) },
      },
    });

    this.logger.log(
      `Escrow ${escrowHoldId} released by ${userId} — payout ${payout.id} created for vendor ${vendor.id}`,
    );

    return {
      escrowHold: updatedEscrow,
      payout: { id: payout.id, amount: vendorAmount, scheduledAt },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSACTION HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  async getTransactionHistory(userId: string, take = 20, skip = 0) {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          booking: {
            select: { id: true, eventDate: true },
          },
          installment: {
            select: { id: true, label: true, type: true },
          },
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        take,
        skip,
        hasMore: skip + take < total,
      },
    };
  }
}
