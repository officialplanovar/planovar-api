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
  InstallmentStatus,
  NotificationType,
  Prisma,
  QuotePaymentStructure,
  QuoteStatus,
  UserRole,
} from '@prisma/client';
import { EmailService } from '../../common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

/**
 * Quotes = structured PRICE PROPOSALS sent by a vendor on a booking inquiry
 * (subscription-only model — no in-platform payment). The payment-structure /
 * installment fields describe the off-platform payment terms the parties
 * agree to; the platform never charges them.
 * Client accept → quote locks + the underlying booking is CONFIRMED.
 */
@Injectable()
export class QuotesService {
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

  private async assertVendorOwns(quoteId: string, userId: string) {
    const vendor = await this.getVendorProfile(userId);
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.vendorId !== vendor.id) throw new ForbiddenException('Not your quote');
    return { quote, vendor };
  }

  private async assertClientOwns(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: { select: { clientId: true } } },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.booking?.clientId !== userId) throw new ForbiddenException('Not your quote');
    return { quote };
  }

  async create(userId: string, dto: CreateQuoteDto) {
    const vendor = await this.getVendorProfile(userId);

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        client: { select: { id: true, email: true, firstName: true, name: true } },
        listing: { select: { title: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId !== vendor.id) throw new ForbiddenException('Booking does not belong to your vendor account');

    const needsInstallments =
      dto.paymentStructure === QuotePaymentStructure.INSTALLMENTS ||
      dto.paymentStructure === QuotePaymentStructure.CUSTOM_ESCROW;

    if (needsInstallments && (!dto.installments || dto.installments.length === 0)) {
      throw new BadRequestException('Installments are required for INSTALLMENTS and CUSTOM_ESCROW payment structures');
    }

    if (dto.installments && dto.installments.length > 0) {
      const sum = dto.installments.reduce((acc, i) => acc + i.percentage, 0);
      if (Math.round(sum) !== 100) {
        throw new BadRequestException(`Installment percentages must sum to 100 (got ${sum})`);
      }
    }

    const quote = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          bookingId: dto.bookingId,
          vendorId: vendor.id,
          status: QuoteStatus.PENDING,
          paymentStructure: dto.paymentStructure,
          amount: new Prisma.Decimal(dto.totalAmount),
          escrowPercentage: dto.escrowPercentage != null ? new Prisma.Decimal(dto.escrowPercentage) : undefined,
          validUntil: new Date(dto.validUntil),
          notes: dto.notes,
          description: dto.description,
          isLocked: false,
        },
      });

      await tx.quoteLineItem.createMany({
        data: dto.lineItems.map((item, index) => ({
          quoteId: created.id,
          label: item.label,
          amount: new Prisma.Decimal(item.amount),
          sortOrder: item.sortOrder ?? index,
        })),
      });

      if (dto.installments && dto.installments.length > 0) {
        await tx.paymentInstallment.createMany({
          data: dto.installments.map((inst, index) => ({
            quoteId: created.id,
            label: inst.label,
            type: inst.type,
            percentage: new Prisma.Decimal(inst.percentage),
            amount: new Prisma.Decimal((inst.percentage / 100) * dto.totalAmount),
            dueAt: new Date(inst.dueAt),
            status: InstallmentStatus.PENDING,
            sortOrder: inst.sortOrder ?? index,
          })),
        });
      }

      return created;
    });

    const vendorName = vendor.user.firstName ?? vendor.user.name ?? vendor.businessName;
    void this.email.sendQuoteReceived(booking.client.email, {
      clientName: booking.client.firstName ?? booking.client.name ?? 'Client',
      vendorName,
      listingTitle: booking.listing.title,
      amount: dto.totalAmount.toLocaleString(),
      validUntil: new Date(dto.validUntil).toDateString(),
    });
    void this.notifications
      .create(
        booking.client.id,
        NotificationType.QUOTE_RECEIVED,
        'New quote received',
        `${vendorName} sent you a quote for "${booking.listing.title}" — ₦${dto.totalAmount.toLocaleString()}`,
        { quoteId: quote.id, bookingId: dto.bookingId },
      )
      .catch(() => void 0);

    return quote;
  }

  async findAll(userId: string, role: UserRole) {
    if (role === UserRole.VENDOR) {
      const vendor = await this.getVendorProfile(userId);
      return this.prisma.quote.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        include: {
          booking: { select: { id: true, eventDate: true } },
        },
      });
    }

    return this.prisma.quote.findMany({
      where: { booking: { clientId: userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { id: true, eventDate: true } },
        vendor: { select: { id: true, businessName: true, slug: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        lineItems: { orderBy: { sortOrder: 'asc' } },
        installments: { orderBy: { sortOrder: 'asc' } },
        booking: {
          select: {
            id: true,
            clientId: true,
            eventDate: true,
            status: true,
          },
        },
        vendor: { select: { id: true, businessName: true, slug: true, userId: true } },
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');

    const isVendor = quote.vendor.userId === userId;
    const isClient = quote.booking?.clientId === userId;
    if (!isVendor && !isClient) throw new NotFoundException('Quote not found');

    return quote;
  }

  async update(id: string, userId: string, dto: UpdateQuoteDto) {
    const { quote } = await this.assertVendorOwns(id, userId);
    if (quote.isLocked) throw new ConflictException('Quote is locked and cannot be updated');

    if (dto.installments && dto.installments.length > 0) {
      const sum = dto.installments.reduce((acc, i) => acc + i.percentage, 0);
      if (Math.round(sum) !== 100) {
        throw new BadRequestException(`Installment percentages must sum to 100 (got ${sum})`);
      }
    }

    const totalAmount = dto.totalAmount ?? quote.amount.toNumber();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.quote.update({
        where: { id },
        data: {
          notes: dto.notes,
          description: dto.description,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          paymentStructure: dto.paymentStructure,
          escrowPercentage: dto.escrowPercentage != null ? new Prisma.Decimal(dto.escrowPercentage) : undefined,
          amount: dto.totalAmount != null ? new Prisma.Decimal(dto.totalAmount) : undefined,
        },
      });

      if (dto.lineItems) {
        await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
        await tx.quoteLineItem.createMany({
          data: dto.lineItems.map((item, index) => ({
            quoteId: id,
            label: item.label,
            amount: new Prisma.Decimal(item.amount),
            sortOrder: item.sortOrder ?? index,
          })),
        });
      }

      if (dto.installments) {
        await tx.paymentInstallment.deleteMany({ where: { quoteId: id } });
        if (dto.installments.length > 0) {
          await tx.paymentInstallment.createMany({
            data: dto.installments.map((inst, index) => ({
              quoteId: id,
              label: inst.label,
              type: inst.type,
              percentage: new Prisma.Decimal(inst.percentage),
              amount: new Prisma.Decimal((inst.percentage / 100) * totalAmount),
              dueAt: new Date(inst.dueAt),
              status: InstallmentStatus.PENDING,
              sortOrder: inst.sortOrder ?? index,
            })),
          });
        }
      }

      return updated;
    });
  }

  /**
   * Client accepts a quote: the quote locks (terms sealed) and the underlying
   * booking inquiry is CONFIRMED in the same transaction — "Accept & Book".
   * No payment step (subscription-only model; payment happens off-platform).
   */
  async accept(id: string, userId: string) {
    const { quote } = await this.assertClientOwns(id, userId);
    if (quote.status !== QuoteStatus.PENDING) {
      throw new ConflictException(`Cannot accept a quote with status ${quote.status}`);
    }

    // Expired quotes can't be accepted — mark them and tell the client.
    if (quote.validUntil < new Date()) {
      await this.prisma.quote.update({
        where: { id },
        data: { status: QuoteStatus.EXPIRED },
      });
      throw new ConflictException('This quote has expired — ask the vendor to re-issue it');
    }

    if (!quote.bookingId) {
      throw new ConflictException('This quote is not linked to a booking');
    }
    const booking = await this.prisma.booking.findUnique({
      where: { id: quote.bookingId },
      select: { id: true, status: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const confirmsBooking = booking.status === BookingStatus.PENDING;

    const [updated] = await this.prisma.$transaction([
      this.prisma.quote.update({
        where: { id },
        data: {
          status: QuoteStatus.ACCEPTED,
          isLocked: true,
          lockedAt: new Date(),
        },
        include: {
          vendor: {
            include: { user: { select: { id: true, email: true, firstName: true, name: true } } },
          },
          booking: {
            include: {
              client: { select: { id: true, email: true, firstName: true, name: true } },
              listing: { select: { title: true } },
            },
          },
        },
      }),
      // Agreed amount lands on the booking either way.
      this.prisma.booking.update({
        where: { id: quote.bookingId },
        data: {
          finalAmount: quote.amount,
          quoteAmount: quote.amount,
          ...(confirmsBooking && { status: BookingStatus.CONFIRMED }),
        },
      }),
      ...(confirmsBooking
        ? [
            this.prisma.bookingStatusHistory.create({
              data: {
                bookingId: quote.bookingId,
                fromStatus: BookingStatus.PENDING,
                toStatus: BookingStatus.CONFIRMED,
                changedBy: userId,
                reason: 'Quote accepted',
              },
            }),
          ]
        : []),
    ]);

    if (!updated.booking) {
      throw new ConflictException('This quote is not linked to a booking');
    }
    const vendorName =
      updated.vendor.user.firstName ?? updated.vendor.user.name ?? updated.vendor.businessName;
    const clientName =
      updated.booking.client.firstName ?? updated.booking.client.name ?? 'Client';
    const amountLabel = quote.amount.toNumber().toLocaleString();

    void this.email.sendQuoteAccepted(updated.vendor.user.email, {
      vendorName,
      clientName,
      listingTitle: updated.booking.listing.title,
      amount: amountLabel,
    });
    void this.notifications
      .create(
        updated.vendor.user.id,
        NotificationType.QUOTE_ACCEPTED,
        'Quote accepted 🎉',
        `${clientName} accepted your ₦${amountLabel} quote for "${updated.booking.listing.title}"`,
        { quoteId: id, bookingId: quote.bookingId },
      )
      .catch(() => void 0);

    if (confirmsBooking) {
      void this.email.sendBookingConfirmed(updated.booking.client.email, {
        clientName,
        vendorName,
        listingTitle: updated.booking.listing.title,
        eventDate: updated.booking.eventDate.toDateString(),
        eventLocation:
          (updated.booking.eventLocation as any)?.address ?? 'TBD',
      });
      void this.notifications
        .create(
          updated.booking.client.id,
          NotificationType.BOOKING_CONFIRMED,
          'Booking confirmed 🎉',
          `Your booking for "${updated.booking.listing.title}" is confirmed`,
          { bookingId: quote.bookingId },
        )
        .catch(() => void 0);
    }

    return updated;
  }

  async reject(id: string, userId: string) {
    const { quote } = await this.assertClientOwns(id, userId);
    if (quote.status !== QuoteStatus.PENDING) {
      throw new ConflictException(`Cannot reject a quote with status ${quote.status}`);
    }
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.REJECTED },
      include: {
        vendor: { select: { userId: true } },
        booking: { include: { listing: { select: { title: true } } } },
      },
    });

    void this.notifications
      .create(
        updated.vendor.userId,
        NotificationType.QUOTE_REJECTED,
        'Quote declined',
        `Your quote for "${updated.booking?.listing.title ?? 'your service'}" was declined — the conversation stays open`,
        { quoteId: id, ...(updated.bookingId ? { bookingId: updated.bookingId } : {}) },
      )
      .catch(() => void 0);

    return updated;
  }
}
