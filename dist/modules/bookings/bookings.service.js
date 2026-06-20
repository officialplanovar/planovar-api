"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const email_service_1 = require("../../common/email/email.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let BookingsService = class BookingsService {
    prisma;
    email;
    notifications;
    constructor(prisma, email, notifications) {
        this.prisma = prisma;
        this.email = email;
        this.notifications = notifications;
    }
    async getVendorProfile(userId) {
        const profile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            include: { user: { select: { email: true, firstName: true, name: true } } },
        });
        if (!profile)
            throw new common_1.NotFoundException('Vendor profile not found');
        return profile;
    }
    extractLocation(eventLocation) {
        if (eventLocation && typeof eventLocation === 'object' && 'address' in eventLocation) {
            return eventLocation.address;
        }
        return 'TBD';
    }
    async create(userId, dto) {
        const clientUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true, name: true },
        });
        if (!clientUser)
            throw new common_1.NotFoundException('User not found');
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id: dto.vendorId },
            include: { user: { select: { id: true, email: true, firstName: true, name: true } } },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        const listing = await this.prisma.listing.findUnique({
            where: { id: dto.listingId },
            select: { title: true, vendorId: true },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.vendorId !== vendor.id) {
            throw new common_1.ConflictException('Listing does not belong to this vendor');
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
                quoteAmount: dto.totalAmount != null ? new client_1.Prisma.Decimal(dto.totalAmount) : undefined,
                status: client_1.BookingStatus.PENDING,
                statusHistory: {
                    create: { toStatus: client_1.BookingStatus.PENDING, changedBy: userId },
                },
            },
        });
        const clientName = clientUser.firstName ?? clientUser.name ?? 'A client';
        void this.email.sendBookingRequest(vendor.user.email, {
            clientName,
            vendorName: vendor.user.firstName ?? vendor.user.name ?? vendor.businessName,
            listingTitle: listing.title,
            eventDate: new Date(dto.eventDate).toDateString(),
            eventLocation: dto.location ?? 'TBD',
            requirements: dto.notes,
        });
        void this.notifications
            .create(vendor.user.id, client_1.NotificationType.BOOKING_REQUEST, 'New booking inquiry', `${clientName} wants to book "${listing.title}"`, { bookingId: booking.id })
            .catch(() => void 0);
        return booking;
    }
    async findAll(userId, role, status, take = 20, skip = 0) {
        const statusWhere = status ? { status } : {};
        if (role === client_1.UserRole.VENDOR) {
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
    async inboxSummary(userId) {
        const vendor = await this.getVendorProfile(userId);
        const groups = await this.prisma.booking.groupBy({
            by: ['status'],
            where: { vendorId: vendor.id },
            _count: { _all: true },
        });
        const counts = {
            PENDING: 0,
            CONFIRMED: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };
        for (const g of groups)
            counts[g.status] = g._count._all;
        return { ...counts, actionNeeded: counts.PENDING };
    }
    async findOne(id, userId) {
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
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isClient = booking.clientId === userId;
        const isVendor = booking.vendor.userId === userId;
        if (!isClient && !isVendor)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    transition(bookingId, fromStatus, toStatus, changedBy, reason) {
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
    async confirm(id, userId) {
        const vendor = await this.getVendorProfile(userId);
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                listing: { select: { title: true } },
                client: { select: { id: true, email: true, firstName: true, name: true } },
                vendor: { select: { user: { select: { firstName: true, name: true } } } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.vendorId !== vendor.id)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.ConflictException(`Cannot confirm a booking with status ${booking.status}`);
        }
        const [updated] = await this.transition(id, booking.status, client_1.BookingStatus.CONFIRMED, userId);
        const vendorName = booking.vendor.user.firstName ?? booking.vendor.user.name ?? vendor.businessName;
        void this.email.sendBookingConfirmed(booking.client.email, {
            clientName: booking.client.firstName ?? booking.client.name ?? 'Client',
            vendorName,
            listingTitle: booking.listing.title,
            eventDate: booking.eventDate.toDateString(),
            eventLocation: this.extractLocation(booking.eventLocation),
        });
        void this.notifications
            .create(booking.client.id, client_1.NotificationType.BOOKING_CONFIRMED, 'Booking confirmed 🎉', `${vendorName} accepted your inquiry for "${booking.listing.title}"`, { bookingId: id })
            .catch(() => void 0);
        return updated;
    }
    async reject(id, userId, reason) {
        const vendor = await this.getVendorProfile(userId);
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                listing: { select: { title: true } },
                client: { select: { id: true, email: true, firstName: true, name: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.vendorId !== vendor.id)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.ConflictException(`Cannot reject a booking with status ${booking.status}`);
        }
        const [updated] = await this.transition(id, booking.status, client_1.BookingStatus.CANCELLED, userId, reason ?? 'Declined by vendor');
        void this.email.sendBookingCancelled(booking.client.email, {
            recipientName: booking.client.firstName ?? booking.client.name ?? 'Client',
            listingTitle: booking.listing.title,
            eventDate: booking.eventDate.toDateString(),
            cancelledBy: 'vendor',
            reason,
        });
        void this.notifications
            .create(booking.client.id, client_1.NotificationType.BOOKING_CANCELLED, 'Inquiry declined', `Your inquiry for "${booking.listing.title}" was declined${reason ? `: ${reason}` : ''}`, { bookingId: id })
            .catch(() => void 0);
        return updated;
    }
    async cancel(id, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                listing: { select: { title: true } },
                vendor: { select: { userId: true, user: { select: { email: true } }, businessName: true } },
                client: { select: { firstName: true, name: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.clientId !== userId)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status !== client_1.BookingStatus.PENDING &&
            booking.status !== client_1.BookingStatus.CONFIRMED) {
            throw new common_1.ConflictException(`Cannot cancel a booking with status ${booking.status}`);
        }
        const [updated] = await this.transition(id, booking.status, client_1.BookingStatus.CANCELLED, userId, 'Cancelled by client');
        void this.email.sendBookingCancelled(booking.vendor.user.email, {
            recipientName: booking.vendor.businessName,
            listingTitle: booking.listing.title,
            eventDate: booking.eventDate.toDateString(),
            cancelledBy: 'client',
        });
        void this.notifications
            .create(booking.vendor.userId, client_1.NotificationType.BOOKING_CANCELLED, 'Booking cancelled', `${booking.client.firstName ?? booking.client.name ?? 'The client'} cancelled "${booking.listing.title}"`, { bookingId: id })
            .catch(() => void 0);
        return updated;
    }
    async complete(id, userId) {
        const vendor = await this.getVendorProfile(userId);
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.vendorId !== vendor.id)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status !== client_1.BookingStatus.CONFIRMED) {
            throw new common_1.ConflictException(`Cannot complete a booking with status ${booking.status}`);
        }
        const [updated] = await this.transition(id, booking.status, client_1.BookingStatus.COMPLETED, userId);
        void this.notifications
            .create(booking.clientId, client_1.NotificationType.REVIEW_REQUESTED, 'How did it go? ⭐', 'Your booking is complete — leave the vendor a review', { bookingId: id })
            .catch(() => void 0);
        return updated;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(email_service_1.EmailService)),
    __param(2, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map