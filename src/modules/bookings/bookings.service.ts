import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, NotificationType, Prisma, UserRole } from '@prisma/client';
import { EmailService } from '../../common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';

/**
 * Booking INQUIRIES (subscription-only model — no payment step anywhere):
 * client sends an inquiry → vendor accepts/declines → vendor marks complete.
 * Status machine: PENDING → CONFIRMED → COMPLETED, with CANCELLED reachable
 * from PENDING/CONFIRMED (by client) or PENDING (vendor decline).
 * Every transition is recorded in BookingStatusHistory and fans out
 * email + in-app/push notifications.
 */
@Injectable()
export class BookingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly email: EmailService,
    @Inject(NotificationsService) private readonly notifications: NotificationsService,
  ) {}

  private async getVendorProfile(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true, firstName: true, name: true } } },
    });
    if (!profile) throw new NotFoundException('Vendor profile not found');
    return profile;
  }

  private extractLocation(eventLocation: unknown): string {
    if (eventLocation && typeof eventLocation === 'object' && 'address' in (eventLocation as object)) {
      return (eventLocation as any).address;
    }
    return 'TBD';
  }

  // ─── Create (client → vendor inquiry) ──────────────────────────────────────

  async create(userId: string, dto: CreateBookingDto) {
    const clientUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, name: true },
    });
    if (!clientUser) throw new NotFoundException('User not found');

    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: dto.vendorId },
      include: { user: { select: { id: true, email: true, firstName: true, name: true } } },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { title: true, vendorId: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.vendorId !== vendor.id) {
      throw new ConflictException('Listing does not belong to this vendor');
    }

    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        vendorId: dto.vendorId,
        listingId: dto.listingId,
        packageId: dto.packageId,
        eventId: dto.eventId,
        eventDate: new Date(dto.eventDate),
        eventLocation: dto.location ? { address: dto.location } : {},
        requirements: dto.notes,
        quoteAmount: dto.totalAmount != null ? new Prisma.Decimal(dto.totalAmount) : undefined,
        status: BookingStatus.PENDING,
        statusHistory: {
          create: { toStatus: BookingStatus.PENDING, changedBy: userId },
        },
      },
    });

    const clientName = clientUser.firstName ?? clientUser.name ?? 'A client';

    // Fan-out (fire-and-forget — EmailService never throws; push best-effort)
    void this.email.sendBookingRequest(vendor.user.email, {
      clientName,
      vendorName: vendor.user.firstName ?? vendor.user.name ?? vendor.businessName,
      listingTitle: listing.title,
      eventDate: new Date(dto.eventDate).toDateString(),
      eventLocation: dto.location ?? 'TBD',
      requirements: dto.notes,
    });
    void this.notifications
      .create(
        vendor.user.id,
        NotificationType.BOOKING_REQUEST,
        'New booking inquiry',
        `${clientName} wants to book "${listing.title}"`,
        { bookingId: booking.id },
      )
      .catch(() => void 0);

    return booking;
  }

  // ─── Lists / inbox ──────────────────────────────────────────────────────────

  async findAll(
    userId: string,
    role: UserRole,
    status?: BookingStatus,
    take = 20,
    skip = 0,
  ) {
    const statusWhere = status ? { status } : {};

    if (role === UserRole.VENDOR) {
      const vendor = await this.getVendorProfile(userId);
      return this.prisma.booking.findMany({
        where: { vendorId: vendor.id, ...statusWhere },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          listing: { select: { id: true, title: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      });
    }

    return this.prisma.booking.findMany({
      where: { clientId: userId, ...statusWhere },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        listing: { select: { id: true, title: true } },
        vendor: { select: { id: true, businessName: true, slug: true } },
      },
    });
  }

  /** Vendor inbox badge counts, grouped by status (PENDING = "action needed"). */
  async inboxSummary(userId: string) {
    const vendor = await this.getVendorProfile(userId);
    const groups = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { vendorId: vendor.id },
      _count: { _all: true },
    });
    const counts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const g of groups) counts[g.status] = g._count._all;
    return { ...counts, actionNeeded: counts.PENDING };
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true } },
        vendor: { select: { id: true, businessName: true, slug: true, userId: true } },
        client: { select: { id: true, name: true, email: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        quotes: {
          include: {
            lineItems: { orderBy: { sortOrder: 'asc' } },
            installments: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const isClient = booking.clientId === userId;
    const isVendor = booking.vendor.userId === userId;
    if (!isClient && !isVendor) throw new NotFoundException('Booking not found');

    return booking;
  }

  // ─── Transitions (each writes status history in the same transaction) ──────

  private transition(
    bookingId: string,
    fromStatus: BookingStatus,
    toStatus: BookingStatus,
    changedBy: string,
    reason?: string,
  ) {
    return this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: toStatus },
      }),
      this.prisma.bookingStatusHistory.create({
        data: { bookingId, fromStatus, toStatus, changedBy, reason: reason ?? null },
      }),
    ]);
  }

  /** Vendor accepts a pending inquiry. */
  async confirm(id: string, userId: string) {
    const vendor = await this.getVendorProfile(userId);
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { select: { title: true } },
        client: { select: { id: true, email: true, firstName: true, name: true } },
        vendor: { select: { user: { select: { firstName: true, name: true } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId !== vendor.id) throw new ForbiddenException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException(`Cannot confirm a booking with status ${booking.status}`);
    }

    const [updated] = await this.transition(id, booking.status, BookingStatus.CONFIRMED, userId);

    const vendorName =
      booking.vendor.user.firstName ?? booking.vendor.user.name ?? vendor.businessName;
    void this.email.sendBookingConfirmed(booking.client.email, {
      clientName: booking.client.firstName ?? booking.client.name ?? 'Client',
      vendorName,
      listingTitle: booking.listing.title,
      eventDate: booking.eventDate.toDateString(),
      eventLocation: this.extractLocation(booking.eventLocation),
    });
    void this.notifications
      .create(
        booking.client.id,
        NotificationType.BOOKING_CONFIRMED,
        'Booking confirmed 🎉',
        `${vendorName} accepted your inquiry for "${booking.listing.title}"`,
        { bookingId: id },
      )
      .catch(() => void 0);

    return updated;
  }

  /** Vendor declines a pending inquiry. */
  async reject(id: string, userId: string, reason?: string) {
    const vendor = await this.getVendorProfile(userId);
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { select: { title: true } },
        client: { select: { id: true, email: true, firstName: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId !== vendor.id) throw new ForbiddenException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException(`Cannot reject a booking with status ${booking.status}`);
    }

    const [updated] = await this.transition(
      id,
      booking.status,
      BookingStatus.CANCELLED,
      userId,
      reason ?? 'Declined by vendor',
    );

    void this.email.sendBookingCancelled(booking.client.email, {
      recipientName: booking.client.firstName ?? booking.client.name ?? 'Client',
      listingTitle: booking.listing.title,
      eventDate: booking.eventDate.toDateString(),
      cancelledBy: 'vendor',
      reason,
    });
    void this.notifications
      .create(
        booking.client.id,
        NotificationType.BOOKING_CANCELLED,
        'Inquiry declined',
        `Your inquiry for "${booking.listing.title}" was declined${reason ? `: ${reason}` : ''}`,
        { bookingId: id },
      )
      .catch(() => void 0);

    return updated;
  }

  /** Client cancels their own inquiry/booking. */
  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { select: { title: true } },
        vendor: { select: { userId: true, user: { select: { email: true } }, businessName: true } },
        client: { select: { firstName: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== userId) throw new ForbiddenException('Not your booking');
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new ConflictException(`Cannot cancel a booking with status ${booking.status}`);
    }

    const [updated] = await this.transition(
      id,
      booking.status,
      BookingStatus.CANCELLED,
      userId,
      'Cancelled by client',
    );

    void this.email.sendBookingCancelled(booking.vendor.user.email, {
      recipientName: booking.vendor.businessName,
      listingTitle: booking.listing.title,
      eventDate: booking.eventDate.toDateString(),
      cancelledBy: 'client',
    });
    void this.notifications
      .create(
        booking.vendor.userId,
        NotificationType.BOOKING_CANCELLED,
        'Booking cancelled',
        `${booking.client.firstName ?? booking.client.name ?? 'The client'} cancelled "${booking.listing.title}"`,
        { bookingId: id },
      )
      .catch(() => void 0);

    return updated;
  }

  /** Vendor marks a confirmed booking as completed (unlocks the client review). */
  async complete(id: string, userId: string) {
    const vendor = await this.getVendorProfile(userId);
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId !== vendor.id) throw new ForbiddenException('Not your booking');
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new ConflictException(`Cannot complete a booking with status ${booking.status}`);
    }

    const [updated] = await this.transition(id, booking.status, BookingStatus.COMPLETED, userId);

    void this.notifications
      .create(
        booking.clientId,
        NotificationType.REVIEW_REQUESTED,
        'How did it go? ⭐',
        'Your booking is complete — leave the vendor a review',
        { bookingId: id },
      )
      .catch(() => void 0);

    return updated;
  }
}
