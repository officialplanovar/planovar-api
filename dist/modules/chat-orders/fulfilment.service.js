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
exports.FulfilmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const reviews_service_1 = require("../reviews/reviews.service");
const chat_card_service_1 = require("./chat-card.service");
let FulfilmentService = class FulfilmentService {
    prisma;
    cards;
    reviews;
    notifications;
    constructor(prisma, cards, reviews, notifications) {
        this.prisma = prisma;
        this.cards = cards;
        this.reviews = reviews;
        this.notifications = notifications;
    }
    async vendorFor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return vendor;
    }
    async loadBooking(bookingId) {
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
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async postUpdate(vendorUserId, bookingId, message) {
        const vendor = await this.vendorFor(vendorUserId);
        const booking = await this.loadBooking(bookingId);
        if (booking.vendorId !== vendor.id) {
            throw new common_1.ForbiddenException('Not your booking');
        }
        const conversationId = booking.invoice?.conversationId;
        if (!conversationId)
            throw new common_1.BadRequestException('No conversation for this booking');
        const card = await this.prisma.$transaction((tx) => this.cards.post(tx, {
            conversationId,
            senderId: vendorUserId,
            type: client_1.MessageType.TIMELINE_UPDATE,
            bookingId: booking.id,
            content: message,
        }));
        await this.cards.broadcast(card.id);
        void this.notifications
            .create(booking.clientId, client_1.NotificationType.SYSTEM, 'Order update', message, {
            bookingId,
        })
            .catch(() => void 0);
        return { posted: true };
    }
    async markDelivered(vendorUserId, bookingId) {
        const vendor = await this.vendorFor(vendorUserId);
        const booking = await this.loadBooking(bookingId);
        if (booking.vendorId !== vendor.id) {
            throw new common_1.ForbiddenException('Not your booking');
        }
        if (booking.status === client_1.BookingStatus.COMPLETED) {
            throw new common_1.ConflictException('This booking is already completed');
        }
        if (booking.status === client_1.BookingStatus.CANCELLED) {
            throw new common_1.ConflictException('This booking was cancelled');
        }
        const conversationId = booking.invoice?.conversationId;
        if (!conversationId)
            throw new common_1.BadRequestException('No conversation for this booking');
        const cardIds = await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.COMPLETED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId: booking.id,
                    fromStatus: booking.status,
                    toStatus: client_1.BookingStatus.COMPLETED,
                    changedBy: vendorUserId,
                    reason: 'Vendor marked as delivered',
                },
            });
            const delivered = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.TIMELINE_UPDATE,
                bookingId: booking.id,
                content: 'Delivered — service completed',
                metadata: { status: 'delivered' },
            });
            const reviewReq = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.REVIEW_REQUESTED,
                bookingId: booking.id,
            });
            return [delivered.id, reviewReq.id];
        });
        await this.cards.broadcastMany(cardIds);
        void this.notifications
            .create(booking.clientId, client_1.NotificationType.REVIEW_REQUESTED, 'How did it go? ⭐', `"${booking.listing.title}" is complete — leave a review`, { bookingId })
            .catch(() => void 0);
        return { completed: true };
    }
    async confirmReturn(vendorUserId, bookingId) {
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
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.vendorId !== vendor.id) {
            throw new common_1.ForbiddenException('Not your booking');
        }
        if (booking.status === client_1.BookingStatus.COMPLETED) {
            throw new common_1.ConflictException('This rental is already completed');
        }
        if (booking.status === client_1.BookingStatus.CANCELLED) {
            throw new common_1.ConflictException('This booking was cancelled');
        }
        const conversationId = booking.invoice?.conversationId;
        if (!conversationId)
            throw new common_1.BadRequestException('No conversation for this booking');
        const deposit = booking.depositAmount ? booking.depositAmount.toNumber() : 0;
        const cardIds = await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.COMPLETED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId: booking.id,
                    fromStatus: booking.status,
                    toStatus: client_1.BookingStatus.COMPLETED,
                    changedBy: vendorUserId,
                    reason: 'Rental returned',
                },
            });
            const returned = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.TIMELINE_UPDATE,
                bookingId: booking.id,
                content: 'Item returned — rental complete',
                metadata: { status: 'returned' },
            });
            const ids = [returned.id];
            if (deposit > 0) {
                const refund = await this.cards.post(tx, {
                    conversationId,
                    senderId: vendorUserId,
                    type: client_1.MessageType.DEPOSIT_REFUNDED,
                    bookingId: booking.id,
                    metadata: { amount: deposit.toString() },
                });
                ids.push(refund.id);
            }
            const reviewReq = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.REVIEW_REQUESTED,
                bookingId: booking.id,
            });
            ids.push(reviewReq.id);
            return ids;
        });
        await this.cards.broadcastMany(cardIds);
        void this.notifications
            .create(booking.clientId, deposit > 0
            ? client_1.NotificationType.REFUND_PROCESSED
            : client_1.NotificationType.REVIEW_REQUESTED, deposit > 0 ? 'Deposit refunded 💰' : 'How did it go? ⭐', deposit > 0
            ? `Your ₦${deposit.toLocaleString()} deposit for "${booking.listing.title}" has been refunded`
            : `"${booking.listing.title}" is complete — leave a review`, { bookingId })
            .catch(() => void 0);
        return { completed: true, depositRefunded: deposit > 0 };
    }
    async submitReview(clientUserId, bookingId, dto) {
        await this.reviews.create(clientUserId, {
            bookingId,
            rating: dto.rating,
            body: dto.body,
            title: dto.title,
        });
        const booking = await this.loadBooking(bookingId);
        const conversationId = booking.invoice?.conversationId;
        if (conversationId) {
            const card = await this.prisma.$transaction((tx) => this.cards.post(tx, {
                conversationId,
                senderId: clientUserId,
                type: client_1.MessageType.REVIEW_SUBMITTED,
                bookingId,
                metadata: { rating: String(dto.rating) },
            }));
            await this.cards.broadcast(card.id);
            const vendor = await this.prisma.vendorProfile.findUnique({
                where: { id: booking.vendorId },
                select: { userId: true },
            });
            if (vendor) {
                void this.notifications
                    .create(vendor.userId, client_1.NotificationType.REVIEW_RECEIVED, 'New review ⭐', `A client left a ${dto.rating}-star review`, { bookingId })
                    .catch(() => void 0);
            }
        }
        return { submitted: true };
    }
};
exports.FulfilmentService = FulfilmentService;
exports.FulfilmentService = FulfilmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(chat_card_service_1.ChatCardService)),
    __param(2, (0, common_1.Inject)(reviews_service_1.ReviewsService)),
    __param(3, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_card_service_1.ChatCardService,
        reviews_service_1.ReviewsService,
        notifications_service_1.NotificationsService])
], FulfilmentService);
//# sourceMappingURL=fulfilment.service.js.map