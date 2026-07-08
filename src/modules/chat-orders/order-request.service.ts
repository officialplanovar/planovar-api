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
  MessageType,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatCardService } from './chat-card.service';
import { InvoiceService } from './invoice.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';

/**
 * Direct product / rental orders (no quote). The client sends an ORDER_REQUEST
 * card into the DM; the vendor Accepts (→ booking CONFIRMED + invoice with a
 * single payable milestone) or Declines (→ booking CANCELLED).
 */
@Injectable()
export class OrderRequestService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatCardService) private readonly cards: ChatCardService,
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  private async vendorFor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  /** Find or create the DM conversation between this client and vendor. */
  private async getOrCreateDirect(
    clientId: string,
    vendorId: string,
    vendorUserId: string,
  ) {
    const existing = await this.prisma.conversation.findFirst({
      where: { type: 'DIRECT', clientId, vendorId },
      select: { id: true },
    });
    if (existing) return existing.id;
    const created = await this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        clientId,
        vendorId,
        participants: { create: [{ userId: clientId }, { userId: vendorUserId }] },
      },
      select: { id: true },
    });
    return created.id;
  }

  // ── Client creates a request ──────────────────────────────────────────────

  async createOrderRequest(clientUserId: string, dto: CreateOrderRequestDto) {
    if (dto.fulfilmentType === FulfilmentType.SERVICE) {
      throw new BadRequestException(
        'Services go through the quote flow, not direct orders',
      );
    }
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: {
        id: true,
        title: true,
        vendorId: true,
        vendor: { select: { userId: true } },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const delivery = dto.deliveryFee ?? 0;
    const deposit = dto.depositAmount ?? 0;
    const total = dto.amount + delivery + deposit;

    const conversationId = await this.getOrCreateDirect(
      clientUserId,
      listing.vendorId,
      listing.vendor.userId,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          clientId: clientUserId,
          vendorId: listing.vendorId,
          listingId: listing.id,
          eventId: dto.eventId ?? null,
          status: BookingStatus.PENDING,
          fulfilmentType: dto.fulfilmentType,
          deliveryMethod: dto.deliveryMethod,
          deliveryFee: delivery ? new Prisma.Decimal(delivery) : null,
          depositAmount: deposit ? new Prisma.Decimal(deposit) : null,
          lateFeePerDay:
            dto.lateFeePerDay != null
              ? new Prisma.Decimal(dto.lateFeePerDay)
              : null,
          pickupAt: dto.pickupAt ? new Date(dto.pickupAt) : null,
          returnAt: dto.returnAt ? new Date(dto.returnAt) : null,
          eventDate: dto.pickupAt ? new Date(dto.pickupAt) : new Date(),
          eventLocation: (dto.address
            ? { address: dto.address }
            : {}) as Prisma.InputJsonValue,
          quoteAmount: new Prisma.Decimal(dto.amount),
          finalAmount: new Prisma.Decimal(total),
          notes: dto.notes ?? null,
        },
      });

      const message = await this.cards.post(tx, {
        conversationId,
        senderId: clientUserId,
        type: MessageType.ORDER_REQUEST,
        bookingId: booking.id,
        content: dto.notes ?? null,
        metadata: {
          listing: listing.title,
          total: String(total),
          fulfilment: dto.fulfilmentType,
        },
      });
      return { booking, message };
    });

    await this.cards.broadcast(result.message.id);
    void this.notifications
      .create(
        listing.vendor.userId,
        NotificationType.BOOKING_REQUEST,
        'New order request',
        `A client requested "${listing.title}" — ₦${total.toLocaleString()}`,
        { bookingId: result.booking.id },
      )
      .catch(() => void 0);

    return result;
  }

  // ── Vendor accepts / declines ─────────────────────────────────────────────

  async respondToOrder(vendorUserId: string, bookingId: string, accept: boolean) {
    const vendor = await this.vendorFor(vendorUserId);
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { title: true } } },
    });
    if (!booking) throw new NotFoundException('Order request not found');
    if (booking.vendorId !== vendor.id) {
      throw new ForbiddenException('Not your order request');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException('This request has already been handled');
    }

    const conv = await this.prisma.conversation.findFirst({
      where: { type: 'DIRECT', clientId: booking.clientId, vendorId: vendor.id },
      select: { id: true },
    });
    const conversationId = conv?.id;

    if (!accept) {
      const { updated, cardId } = await this.prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED },
        });
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: BookingStatus.PENDING,
            toStatus: BookingStatus.CANCELLED,
            changedBy: vendorUserId,
            reason: 'Vendor declined the request',
          },
        });
        let cid: string | null = null;
        if (conversationId) {
          const card = await this.cards.post(tx, {
            conversationId,
            senderId: vendorUserId,
            type: MessageType.ORDER_DECLINED,
            bookingId: booking.id,
          });
          cid = card.id;
        }
        return { updated: b, cardId: cid };
      });

      if (cardId) await this.cards.broadcast(cardId);
      void this.notifications
        .create(
          booking.clientId,
          NotificationType.BOOKING_CANCELLED,
          'Order declined',
          `Your request for "${booking.listing.title}" was declined`,
          { bookingId: booking.id },
        )
        .catch(() => void 0);
      return updated;
    }

    // Accept → confirm + build a payable invoice.
    if (!conversationId) {
      throw new BadRequestException('No conversation for this order');
    }
    const lineItems: { label: string; amount: number }[] = [
      { label: booking.listing.title, amount: booking.quoteAmount?.toNumber() ?? 0 },
    ];
    if (booking.deliveryFee && booking.deliveryFee.toNumber() > 0) {
      lineItems.push({ label: 'Delivery', amount: booking.deliveryFee.toNumber() });
    }
    if (booking.depositAmount && booking.depositAmount.toNumber() > 0) {
      lineItems.push({
        label: 'Refundable deposit',
        amount: booking.depositAmount.toNumber(),
      });
    }

    const { invoice, cardIds } = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
          changedBy: vendorUserId,
          reason: 'Vendor accepted the request',
        },
      });
      const inv = await this.invoices.createDirectInvoiceTx(tx, {
        booking: {
          id: booking.id,
          clientId: booking.clientId,
          vendorId: booking.vendorId,
          eventId: booking.eventId,
          listingId: booking.listingId,
        },
        conversationId,
        lineItems,
      });
      const acceptedCard = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.ORDER_ACCEPTED,
        bookingId: booking.id,
      });
      const invoiceCard = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.INVOICE,
        invoiceId: inv.id,
        bookingId: booking.id,
        metadata: {
          invoiceNumber: inv.invoiceNumber,
          total: inv.total.toString(),
        },
      });
      return { invoice: inv, cardIds: [acceptedCard.id, invoiceCard.id] };
    });

    await this.cards.broadcastMany(cardIds);
    void this.notifications
      .create(
        booking.clientId,
        NotificationType.BOOKING_CONFIRMED,
        'Order accepted 🎉',
        `"${booking.listing.title}" was accepted — invoice ${invoice.invoiceNumber} is ready to pay`,
        { bookingId: booking.id, invoiceId: invoice.id },
      )
      .catch(() => void 0);

    return invoice;
  }
}
