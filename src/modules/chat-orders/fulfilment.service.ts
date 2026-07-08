import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, MessageType, NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ChatCardService } from './chat-card.service';

/**
 * Post-payment fulfilment → completion → review, all surfaced as chat cards.
 *   vendor postUpdate → TIMELINE_UPDATE
 *   vendor markDelivered → booking COMPLETED + TIMELINE_UPDATE + REVIEW_REQUESTED
 *   client submitReview → review (gated to COMPLETED) + REVIEW_SUBMITTED
 */
@Injectable()
export class FulfilmentService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatCardService) private readonly cards: ChatCardService,
    @Inject(ReviewsService) private readonly reviews: ReviewsService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  private async vendorFor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  private async loadBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        clientId: true,
        vendorId: true,
        status: true,
        listing: { select: { title: true } },
        invoice: { select: { conversationId: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /** Vendor posts a progress update → TIMELINE_UPDATE card. */
  async postUpdate(vendorUserId: string, bookingId: string, message: string) {
    const vendor = await this.vendorFor(vendorUserId);
    const booking = await this.loadBooking(bookingId);
    if (booking.vendorId !== vendor.id) {
      throw new ForbiddenException('Not your booking');
    }
    const conversationId = booking.invoice?.conversationId;
    if (!conversationId) throw new BadRequestException('No conversation for this booking');

    const card = await this.prisma.$transaction((tx) =>
      this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.TIMELINE_UPDATE,
        bookingId: booking.id,
        content: message,
      }),
    );
    await this.cards.broadcast(card.id);
    void this.notifications
      .create(booking.clientId, NotificationType.SYSTEM, 'Order update', message, {
        bookingId,
      })
      .catch(() => void 0);
    return { posted: true };
  }

  /** Vendor marks the booking delivered → COMPLETED + review request. */
  async markDelivered(vendorUserId: string, bookingId: string) {
    const vendor = await this.vendorFor(vendorUserId);
    const booking = await this.loadBooking(bookingId);
    if (booking.vendorId !== vendor.id) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new ConflictException('This booking is already completed');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('This booking was cancelled');
    }
    const conversationId = booking.invoice?.conversationId;
    if (!conversationId) throw new BadRequestException('No conversation for this booking');

    const cardIds = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.COMPLETED,
          changedBy: vendorUserId,
          reason: 'Vendor marked as delivered',
        },
      });
      const delivered = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.TIMELINE_UPDATE,
        bookingId: booking.id,
        content: 'Delivered — service completed',
        metadata: { status: 'delivered' },
      });
      const reviewReq = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.REVIEW_REQUESTED,
        bookingId: booking.id,
      });
      return [delivered.id, reviewReq.id];
    });

    await this.cards.broadcastMany(cardIds);
    void this.notifications
      .create(
        booking.clientId,
        NotificationType.REVIEW_REQUESTED,
        'How did it go? ⭐',
        `"${booking.listing.title}" is complete — leave a review`,
        { bookingId },
      )
      .catch(() => void 0);
    return { completed: true };
  }

  /** Vendor confirms a rental was returned → COMPLETED + deposit refunded
   *  (attestation; funds are direct-to-vendor, so the refund itself is the
   *  vendor's to send) + review request. */
  async confirmReturn(vendorUserId: string, bookingId: string) {
    const vendor = await this.vendorFor(vendorUserId);
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        clientId: true,
        vendorId: true,
        status: true,
        depositAmount: true,
        listing: { select: { title: true } },
        invoice: { select: { conversationId: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId !== vendor.id) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new ConflictException('This rental is already completed');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('This booking was cancelled');
    }
    const conversationId = booking.invoice?.conversationId;
    if (!conversationId) throw new BadRequestException('No conversation for this booking');

    const deposit = booking.depositAmount ? booking.depositAmount.toNumber() : 0;

    const cardIds = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.COMPLETED,
          changedBy: vendorUserId,
          reason: 'Rental returned',
        },
      });
      const returned = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.TIMELINE_UPDATE,
        bookingId: booking.id,
        content: 'Item returned — rental complete',
        metadata: { status: 'returned' },
      });
      const ids = [returned.id];
      if (deposit > 0) {
        const refund = await this.cards.post(tx, {
          conversationId,
          senderId: vendorUserId,
          type: MessageType.DEPOSIT_REFUNDED,
          bookingId: booking.id,
          metadata: { amount: deposit.toString() },
        });
        ids.push(refund.id);
      }
      const reviewReq = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.REVIEW_REQUESTED,
        bookingId: booking.id,
      });
      ids.push(reviewReq.id);
      return ids;
    });

    await this.cards.broadcastMany(cardIds);
    void this.notifications
      .create(
        booking.clientId,
        deposit > 0
          ? NotificationType.REFUND_PROCESSED
          : NotificationType.REVIEW_REQUESTED,
        deposit > 0 ? 'Deposit refunded 💰' : 'How did it go? ⭐',
        deposit > 0
          ? `Your ₦${deposit.toLocaleString()} deposit for "${booking.listing.title}" has been refunded`
          : `"${booking.listing.title}" is complete — leave a review`,
        { bookingId },
      )
      .catch(() => void 0);
    return { completed: true, depositRefunded: deposit > 0 };
  }

  /** Client submits a review (gated to a COMPLETED booking) → REVIEW_SUBMITTED. */
  async submitReview(
    clientUserId: string,
    bookingId: string,
    dto: { rating: number; body: string; title?: string },
  ) {
    await this.reviews.create(clientUserId, {
      bookingId,
      rating: dto.rating,
      body: dto.body,
      title: dto.title,
    });

    const booking = await this.loadBooking(bookingId);
    const conversationId = booking.invoice?.conversationId;
    if (conversationId) {
      const card = await this.prisma.$transaction((tx) =>
        this.cards.post(tx, {
          conversationId,
          senderId: clientUserId,
          type: MessageType.REVIEW_SUBMITTED,
          bookingId,
          metadata: { rating: String(dto.rating) },
        }),
      );
      await this.cards.broadcast(card.id);
      const vendor = await this.prisma.vendorProfile.findUnique({
        where: { id: booking.vendorId },
        select: { userId: true },
      });
      if (vendor) {
        void this.notifications
          .create(
            vendor.userId,
            NotificationType.REVIEW_RECEIVED,
            'New review ⭐',
            `A client left a ${dto.rating}-star review`,
            { bookingId },
          )
          .catch(() => void 0);
      }
    }
    return { submitted: true };
  }
}
