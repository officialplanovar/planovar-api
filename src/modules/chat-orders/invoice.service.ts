import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  BookingStatus,
  FulfilmentType,
  InvoiceStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Minimal shape the invoice needs from an accepted quote. */
export type QuoteForInvoice = {
  id: string;
  clientId: string | null;
  vendorId: string;
  listingId: string | null;
  eventId: string | null;
  conversationId: string | null;
  amount: Prisma.Decimal;
  paymentTerms: string | null;
  lineItems: { label: string; amount: Prisma.Decimal; sortOrder: number }[];
};

/**
 * Builds DISPLAY-ONLY invoices from an accepted quote or a direct order. An
 * invoice is a record of the agreement (line items, total, free-text payment
 * terms) — the platform does not charge anyone. Client↔vendor payment happens
 * off-platform.
 */
@Injectable()
export class InvoiceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private ref(prefix: string): string {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1e4,
    )
      .toString()
      .padStart(4, '0')}`;
  }

  /**
   * Materialize a display-only Invoice (+ line items) and the Booking from an
   * accepted quote. Must be called inside the accept transaction.
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
        // Free-text terms the vendor wrote on the quote, carried through for display.
        notes: quote.paymentTerms ?? null,
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

    return invoice;
  }

  /**
   * Create a display-only invoice directly from a booking (the product/rental
   * order flow, which has no quote). Called inside the accept transaction.
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
      paymentTerms?: string | null;
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
        notes: args.paymentTerms ?? null,
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
    return invoice;
  }
}
