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
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const email_service_1 = require("../../common/email/email.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let QuotesService = class QuotesService {
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
    async assertVendorOwns(quoteId, userId) {
        const vendor = await this.getVendorProfile(userId);
        const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        if (quote.vendorId !== vendor.id)
            throw new common_1.ForbiddenException('Not your quote');
        return { quote, vendor };
    }
    async assertClientOwns(quoteId, userId) {
        const quote = await this.prisma.quote.findUnique({
            where: { id: quoteId },
            include: { booking: { select: { clientId: true } } },
        });
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        if (quote.booking.clientId !== userId)
            throw new common_1.ForbiddenException('Not your quote');
        return { quote };
    }
    async create(userId, dto) {
        const vendor = await this.getVendorProfile(userId);
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: {
                client: { select: { id: true, email: true, firstName: true, name: true } },
                listing: { select: { title: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.vendorId !== vendor.id)
            throw new common_1.ForbiddenException('Booking does not belong to your vendor account');
        const needsInstallments = dto.paymentStructure === client_1.QuotePaymentStructure.INSTALLMENTS ||
            dto.paymentStructure === client_1.QuotePaymentStructure.CUSTOM_ESCROW;
        if (needsInstallments && (!dto.installments || dto.installments.length === 0)) {
            throw new common_1.BadRequestException('Installments are required for INSTALLMENTS and CUSTOM_ESCROW payment structures');
        }
        if (dto.installments && dto.installments.length > 0) {
            const sum = dto.installments.reduce((acc, i) => acc + i.percentage, 0);
            if (Math.round(sum) !== 100) {
                throw new common_1.BadRequestException(`Installment percentages must sum to 100 (got ${sum})`);
            }
        }
        const quote = await this.prisma.$transaction(async (tx) => {
            const created = await tx.quote.create({
                data: {
                    bookingId: dto.bookingId,
                    vendorId: vendor.id,
                    status: client_1.QuoteStatus.PENDING,
                    paymentStructure: dto.paymentStructure,
                    amount: new client_1.Prisma.Decimal(dto.totalAmount),
                    escrowPercentage: dto.escrowPercentage != null ? new client_1.Prisma.Decimal(dto.escrowPercentage) : undefined,
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
                    amount: new client_1.Prisma.Decimal(item.amount),
                    sortOrder: item.sortOrder ?? index,
                })),
            });
            if (dto.installments && dto.installments.length > 0) {
                await tx.paymentInstallment.createMany({
                    data: dto.installments.map((inst, index) => ({
                        quoteId: created.id,
                        label: inst.label,
                        type: inst.type,
                        percentage: new client_1.Prisma.Decimal(inst.percentage),
                        amount: new client_1.Prisma.Decimal((inst.percentage / 100) * dto.totalAmount),
                        dueAt: new Date(inst.dueAt),
                        status: client_1.InstallmentStatus.PENDING,
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
            .create(booking.client.id, client_1.NotificationType.QUOTE_RECEIVED, 'New quote received', `${vendorName} sent you a quote for "${booking.listing.title}" — ₦${dto.totalAmount.toLocaleString()}`, { quoteId: quote.id, bookingId: dto.bookingId })
            .catch(() => void 0);
        return quote;
    }
    async findAll(userId, role) {
        if (role === client_1.UserRole.VENDOR) {
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
    async findOne(id, userId) {
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
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        const isVendor = quote.vendor.userId === userId;
        const isClient = quote.booking.clientId === userId;
        if (!isVendor && !isClient)
            throw new common_1.NotFoundException('Quote not found');
        return quote;
    }
    async update(id, userId, dto) {
        const { quote } = await this.assertVendorOwns(id, userId);
        if (quote.isLocked)
            throw new common_1.ConflictException('Quote is locked and cannot be updated');
        if (dto.installments && dto.installments.length > 0) {
            const sum = dto.installments.reduce((acc, i) => acc + i.percentage, 0);
            if (Math.round(sum) !== 100) {
                throw new common_1.BadRequestException(`Installment percentages must sum to 100 (got ${sum})`);
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
                    escrowPercentage: dto.escrowPercentage != null ? new client_1.Prisma.Decimal(dto.escrowPercentage) : undefined,
                    amount: dto.totalAmount != null ? new client_1.Prisma.Decimal(dto.totalAmount) : undefined,
                },
            });
            if (dto.lineItems) {
                await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
                await tx.quoteLineItem.createMany({
                    data: dto.lineItems.map((item, index) => ({
                        quoteId: id,
                        label: item.label,
                        amount: new client_1.Prisma.Decimal(item.amount),
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
                            percentage: new client_1.Prisma.Decimal(inst.percentage),
                            amount: new client_1.Prisma.Decimal((inst.percentage / 100) * totalAmount),
                            dueAt: new Date(inst.dueAt),
                            status: client_1.InstallmentStatus.PENDING,
                            sortOrder: inst.sortOrder ?? index,
                        })),
                    });
                }
            }
            return updated;
        });
    }
    async accept(id, userId) {
        const { quote } = await this.assertClientOwns(id, userId);
        if (quote.status !== client_1.QuoteStatus.PENDING) {
            throw new common_1.ConflictException(`Cannot accept a quote with status ${quote.status}`);
        }
        if (quote.validUntil < new Date()) {
            await this.prisma.quote.update({
                where: { id },
                data: { status: client_1.QuoteStatus.EXPIRED },
            });
            throw new common_1.ConflictException('This quote has expired — ask the vendor to re-issue it');
        }
        const booking = await this.prisma.booking.findUnique({
            where: { id: quote.bookingId },
            select: { id: true, status: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const confirmsBooking = booking.status === client_1.BookingStatus.PENDING;
        const [updated] = await this.prisma.$transaction([
            this.prisma.quote.update({
                where: { id },
                data: {
                    status: client_1.QuoteStatus.ACCEPTED,
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
            this.prisma.booking.update({
                where: { id: quote.bookingId },
                data: {
                    finalAmount: quote.amount,
                    quoteAmount: quote.amount,
                    ...(confirmsBooking && { status: client_1.BookingStatus.CONFIRMED }),
                },
            }),
            ...(confirmsBooking
                ? [
                    this.prisma.bookingStatusHistory.create({
                        data: {
                            bookingId: quote.bookingId,
                            fromStatus: client_1.BookingStatus.PENDING,
                            toStatus: client_1.BookingStatus.CONFIRMED,
                            changedBy: userId,
                            reason: 'Quote accepted',
                        },
                    }),
                ]
                : []),
        ]);
        const vendorName = updated.vendor.user.firstName ?? updated.vendor.user.name ?? updated.vendor.businessName;
        const clientName = updated.booking.client.firstName ?? updated.booking.client.name ?? 'Client';
        const amountLabel = quote.amount.toNumber().toLocaleString();
        void this.email.sendQuoteAccepted(updated.vendor.user.email, {
            vendorName,
            clientName,
            listingTitle: updated.booking.listing.title,
            amount: amountLabel,
        });
        void this.notifications
            .create(updated.vendor.user.id, client_1.NotificationType.QUOTE_ACCEPTED, 'Quote accepted 🎉', `${clientName} accepted your ₦${amountLabel} quote for "${updated.booking.listing.title}"`, { quoteId: id, bookingId: quote.bookingId })
            .catch(() => void 0);
        if (confirmsBooking) {
            void this.email.sendBookingConfirmed(updated.booking.client.email, {
                clientName,
                vendorName,
                listingTitle: updated.booking.listing.title,
                eventDate: updated.booking.eventDate.toDateString(),
                eventLocation: updated.booking.eventLocation?.address ?? 'TBD',
            });
            void this.notifications
                .create(updated.booking.client.id, client_1.NotificationType.BOOKING_CONFIRMED, 'Booking confirmed 🎉', `Your booking for "${updated.booking.listing.title}" is confirmed`, { bookingId: quote.bookingId })
                .catch(() => void 0);
        }
        return updated;
    }
    async reject(id, userId) {
        const { quote } = await this.assertClientOwns(id, userId);
        if (quote.status !== client_1.QuoteStatus.PENDING) {
            throw new common_1.ConflictException(`Cannot reject a quote with status ${quote.status}`);
        }
        const updated = await this.prisma.quote.update({
            where: { id },
            data: { status: client_1.QuoteStatus.REJECTED },
            include: {
                vendor: { select: { userId: true } },
                booking: { include: { listing: { select: { title: true } } } },
            },
        });
        void this.notifications
            .create(updated.vendor.userId, client_1.NotificationType.QUOTE_REJECTED, 'Quote declined', `Your quote for "${updated.booking.listing.title}" was declined — the conversation stays open`, { quoteId: id, bookingId: updated.bookingId })
            .catch(() => void 0);
        return updated;
    }
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(email_service_1.EmailService)),
    __param(2, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map