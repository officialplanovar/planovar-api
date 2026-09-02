import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  FulfilmentType,
  InstallmentStatus,
  InvoiceStatus,
  MessageType,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatCardService } from './chat-card.service';
import { PaystackDirectPayService } from './paystack-directpay.service';

/** Minimal shape the invoice needs from an accepted quote. */
export type QuoteForInvoice = {
  id: string;
  clientId: string | null;
  vendorId: string;
  listingId: string | null;
  eventId: string | null;
  conversationId: string | null;
  amount: Prisma.Decimal;
  paymentTerms: Prisma.JsonValue;
  lineItems: { label: string; amount: Prisma.Decimal; sortOrder: number }[];
};

type MilestoneTerm = {
  label: string;
  percentage: number;
  dueLabel?: string;
  dueAt?: string;
};

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PaystackDirectPayService)
    private readonly paystack: PaystackDirectPayService,
    @Inject(ChatCardService) private readonly cards: ChatCardService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  private ref(prefix: string): string {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1e4,
    )
      .toString()
      .padStart(4, '0')}`;
  }

  /**
   * Materialize an Invoice (+ line items + payable milestones) and the Booking
   * from an accepted quote. Must be called inside the accept transaction.
   */
  async createFromQuoteTx(
    tx: Prisma.TransactionClient,
    quote: QuoteForInvoice,
  ) {
    if (!quote.clientId) throw new BadRequestException('Quote has no client');
    if (!quote.listingId) {
      throw new BadRequestException('Quote has no listing to book');
    }
    if (!quote.conversationId) {
      throw new BadRequestException('Quote is not attached to a conversation');
    }

    const event = quote.eventId
      ? await tx.event.findUnique({
          where: { id: quote.eventId },
          select: { eventDate: true, location: true },
        })
      : null;

    // The accepted quote confirms the booking (invoice-accepted = Confirmed).
    const booking = await tx.booking.create({
      data: {
        clientId: quote.clientId,
        vendorId: quote.vendorId,
        listingId: quote.listingId,
        eventId: quote.eventId ?? null,
        status: BookingStatus.CONFIRMED,
        fulfilmentType: FulfilmentType.SERVICE,
        eventDate: event?.eventDate ?? new Date(),
        eventLocation: (event?.location ?? {}) as Prisma.InputJsonValue,
        quoteAmount: quote.amount,
        finalAmount: quote.amount,
      },
    });

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber: this.ref('INV'),
        quoteId: quote.id,
        conversationId: quote.conversationId,
        bookingId: booking.id,
        vendorId: quote.vendorId,
        clientId: quote.clientId,
        eventId: quote.eventId ?? null,
        listingId: quote.listingId,
        subtotal: quote.amount,
        total: quote.amount,
        status: InvoiceStatus.ACCEPTED,
        lineItems: {
          create: quote.lineItems.map((li, i) => ({
            label: li.label,
            amount: li.amount,
            sortOrder: li.sortOrder ?? i,
          })),
        },
      },
    });

    // Milestones from the quote's proposed terms (or a single 100% tranche).
    const terms: MilestoneTerm[] = Array.isArray(quote.paymentTerms)
      ? (quote.paymentTerms as unknown as MilestoneTerm[])
      : [{ label: 'Full payment', percentage: 100 }];
    const total = quote.amount.toNumber();
    await tx.paymentMilestone.createMany({
      data: terms.map((t, i) => ({
        invoiceId: invoice.id,
        label: t.label,
        dueLabel: t.dueLabel ?? null,
        percentage: new Prisma.Decimal(t.percentage),
        amount: new Prisma.Decimal((total * t.percentage) / 100),
        dueAt: t.dueAt ? new Date(t.dueAt) : null,
        status: InstallmentStatus.PENDING,
        sortOrder: i,
      })),
    });

    return invoice;
  }

  /**
   * Create an invoice + single 100% milestone directly from a booking (the
   * product/rental order flow, which has no quote). Called inside the accept
   * transaction so the client can then pay via the same milestone rails.
   */
  async createDirectInvoiceTx(
    tx: Prisma.TransactionClient,
    args: {
      booking: {
        id: string;
        clientId: string;
        vendorId: string;
        eventId: string | null;
        listingId: string;
      };
      conversationId: string;
      lineItems: { label: string; amount: number }[];
    },
  ) {
    const total = args.lineItems.reduce((s, li) => s + li.amount, 0);
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber: this.ref('INV'),
        conversationId: args.conversationId,
        bookingId: args.booking.id,
        vendorId: args.booking.vendorId,
        clientId: args.booking.clientId,
        eventId: args.booking.eventId ?? null,
        listingId: args.booking.listingId,
        subtotal: new Prisma.Decimal(total),
        total: new Prisma.Decimal(total),
        status: InvoiceStatus.SENT,
        lineItems: {
          create: args.lineItems.map((li, i) => ({
            label: li.label,
            amount: new Prisma.Decimal(li.amount),
            sortOrder: i,
          })),
        },
      },
    });
    await tx.paymentMilestone.create({
      data: {
        invoiceId: invoice.id,
        label: 'Full payment',
        dueLabel: 'Due now',
        percentage: new Prisma.Decimal(100),
        amount: new Prisma.Decimal(total),
        status: InstallmentStatus.PENDING,
        sortOrder: 0,
      },
    });
    return invoice;
  }

  /**
   * Client initiates payment of a milestone → returns a Paystack checkout URL.
   * The vendor's subaccount receives the net; the client bears the fee.
   */
  async payMilestone(userId: string, milestoneId: string) {
    const milestone = await this.prisma.paymentMilestone.findUnique({
      where: { id: milestoneId },
      include: { invoice: { select: { clientId: true, vendorId: true } } },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.invoice.clientId !== userId) {
      throw new ForbiddenException('Not your invoice');
    }
    if (milestone.status === InstallmentStatus.PAID) {
      throw new ConflictException('This milestone is already paid');
    }

    const client = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!client?.email) throw new BadRequestException('Client email missing');

    const subaccount = await this.paystack.ensureSubaccount(
      milestone.invoice.vendorId,
    );
    const netKobo = Math.round(milestone.amount.toNumber() * 100);
    const { chargeKobo, feeKobo } = this.paystack.grossUp(netKobo);
    const reference = `PM_${milestone.id}_${Date.now()}`;

    const { authorizationUrl } = await this.paystack.initSplitCharge({
      email: client.email,
      amountKobo: chargeKobo,
      subaccountCode: subaccount,
      reference,
      metadata: {
        type: 'milestone',
        milestoneId: milestone.id,
        invoiceId: milestone.invoiceId,
      },
    });

    await this.prisma.paymentMilestone.update({
      where: { id: milestone.id },
      data: {
        paystackReference: reference,
        feeAmount: new Prisma.Decimal(feeKobo / 100),
      },
    });

    return {
      authorizationUrl,
      reference,
      netAmount: netKobo / 100,
      feeAmount: feeKobo / 100,
      chargeAmount: chargeKobo / 100,
    };
  }

  /**
   * Confirm a milestone payment by reference (called by the verify endpoint and
   * the Paystack webhook). Idempotent — safe to call repeatedly.
   */
  async confirmByReference(reference: string): Promise<{ confirmed: boolean }> {
    const milestone = await this.prisma.paymentMilestone.findFirst({
      where: { paystackReference: reference },
      include: {
        invoice: { select: { id: true, conversationId: true, clientId: true, vendorId: true } },
      },
    });
    if (!milestone) return { confirmed: false };
    if (milestone.status === InstallmentStatus.PAID) return { confirmed: true };

    const result = await this.paystack.verify(reference);
    if (result.status !== 'success') return { confirmed: false };

    const cardId = await this.prisma.$transaction(async (tx) => {
      // Atomically claim the milestone. The verify endpoint and the webhook can
      // race here — both pass the PAID pre-check above before either commits. A
      // conditional updateMany means only the first writer proceeds; a 0-count
      // means another call already paid it, so we skip the duplicate card /
      // notification / invoice roll-up.
      const claimed = await tx.paymentMilestone.updateMany({
        where: { id: milestone.id, status: { not: InstallmentStatus.PAID } },
        data: { status: InstallmentStatus.PAID, paidAt: new Date() },
      });
      if (claimed.count === 0) return null;

      const paidCard = await this.cards.post(tx, {
        conversationId: milestone.invoice.conversationId,
        senderId: milestone.invoice.clientId,
        type: MessageType.MILESTONE_PAID,
        invoiceId: milestone.invoiceId,
        metadata: {
          milestoneId: milestone.id,
          label: milestone.label,
          amount: milestone.amount.toString(),
        },
      });

      const remaining = await tx.paymentMilestone.count({
        where: {
          invoiceId: milestone.invoiceId,
          status: { not: InstallmentStatus.PAID },
        },
      });
      await tx.invoice.update({
        where: { id: milestone.invoiceId },
        data: {
          status:
            remaining === 0
              ? InvoiceStatus.PAID
              : InvoiceStatus.PARTIALLY_PAID,
        },
      });
      return paidCard.id;
    });

    // Another concurrent call already confirmed this milestone — idempotent
    // success with no duplicate side effects.
    if (cardId === null) return { confirmed: true };

    await this.cards.broadcast(cardId);

    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: milestone.invoice.vendorId },
      select: { userId: true },
    });
    if (vendor) {
      void this.notifications
        .create(
          vendor.userId,
          NotificationType.PAYMENT_RECEIVED,
          'Payment received 💰',
          `A ₦${milestone.amount.toNumber().toLocaleString()} milestone was paid to your account`,
          { milestoneId: milestone.id, invoiceId: milestone.invoiceId },
        )
        .catch(() => void 0);
    }

    return { confirmed: true };
  }
}
