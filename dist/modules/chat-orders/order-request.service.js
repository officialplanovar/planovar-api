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
exports.OrderRequestService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const chat_card_service_1 = require("./chat-card.service");
const invoice_service_1 = require("./invoice.service");
let OrderRequestService = class OrderRequestService {
    prisma;
    cards;
    invoices;
    notifications;
    constructor(prisma, cards, invoices, notifications) {
        this.prisma = prisma;
        this.cards = cards;
        this.invoices = invoices;
        this.notifications = notifications;
    }
    async vendorFor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, userId: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return vendor;
    }
    async getOrCreateDirect(clientId, vendorId, vendorUserId) {
        const existing = await this.prisma.conversation.findFirst({
            where: { type: 'DIRECT', clientId, vendorId },
            select: { id: true },
        });
        if (existing)
            return existing.id;
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
    async createOrderRequest(clientUserId, dto) {
        if (dto.fulfilmentType === client_1.FulfilmentType.SERVICE) {
            throw new common_1.BadRequestException('Services go through the quote flow, not direct orders');
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
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const total = dto.amount;
        const conversationId = await this.getOrCreateDirect(clientUserId, listing.vendorId, listing.vendor.userId);
        const result = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.create({
                data: {
                    clientId: clientUserId,
                    vendorId: listing.vendorId,
                    listingId: listing.id,
                    eventId: dto.eventId ?? null,
                    status: client_1.BookingStatus.PENDING,
                    fulfilmentType: dto.fulfilmentType,
                    deliveryMethod: dto.deliveryMethod,
                    pickupAt: dto.pickupAt ? new Date(dto.pickupAt) : null,
                    returnAt: dto.returnAt ? new Date(dto.returnAt) : null,
                    eventDate: dto.pickupAt ? new Date(dto.pickupAt) : new Date(),
                    eventLocation: (dto.address
                        ? { address: dto.address }
                        : {}),
                    quoteAmount: new client_1.Prisma.Decimal(dto.amount),
                    finalAmount: new client_1.Prisma.Decimal(total),
                    notes: dto.notes ?? null,
                },
            });
            const message = await this.cards.post(tx, {
                conversationId,
                senderId: clientUserId,
                type: client_1.MessageType.ORDER_REQUEST,
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
            .create(listing.vendor.userId, client_1.NotificationType.BOOKING_REQUEST, 'New order request', `A client requested "${listing.title}" — ₦${total.toLocaleString()}`, { bookingId: result.booking.id })
            .catch(() => void 0);
        return result;
    }
    async respondToOrder(vendorUserId, bookingId, accept) {
        const vendor = await this.vendorFor(vendorUserId);
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { listing: { select: { title: true } } },
        });
        if (!booking)
            throw new common_1.NotFoundException('Order request not found');
        if (booking.vendorId !== vendor.id) {
            throw new common_1.ForbiddenException('Not your order request');
        }
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.ConflictException('This request has already been handled');
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
                    data: { status: client_1.BookingStatus.CANCELLED },
                });
                await tx.bookingStatusHistory.create({
                    data: {
                        bookingId: booking.id,
                        fromStatus: client_1.BookingStatus.PENDING,
                        toStatus: client_1.BookingStatus.CANCELLED,
                        changedBy: vendorUserId,
                        reason: 'Vendor declined the request',
                    },
                });
                let cid = null;
                if (conversationId) {
                    const card = await this.cards.post(tx, {
                        conversationId,
                        senderId: vendorUserId,
                        type: client_1.MessageType.ORDER_DECLINED,
                        bookingId: booking.id,
                    });
                    cid = card.id;
                }
                return { updated: b, cardId: cid };
            });
            if (cardId)
                await this.cards.broadcast(cardId);
            void this.notifications
                .create(booking.clientId, client_1.NotificationType.BOOKING_CANCELLED, 'Order declined', `Your request for "${booking.listing.title}" was declined`, { bookingId: booking.id })
                .catch(() => void 0);
            return updated;
        }
        if (!conversationId) {
            throw new common_1.BadRequestException('No conversation for this order');
        }
        const lineItems = [
            { label: booking.listing.title, amount: booking.quoteAmount?.toNumber() ?? 0 },
        ];
        const { invoice, cardIds } = await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.CONFIRMED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId: booking.id,
                    fromStatus: client_1.BookingStatus.PENDING,
                    toStatus: client_1.BookingStatus.CONFIRMED,
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
                type: client_1.MessageType.ORDER_ACCEPTED,
                bookingId: booking.id,
            });
            const invoiceCard = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.INVOICE,
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
            .create(booking.clientId, client_1.NotificationType.BOOKING_CONFIRMED, 'Order accepted 🎉', `"${booking.listing.title}" was accepted — invoice ${invoice.invoiceNumber} is ready to pay`, { bookingId: booking.id, invoiceId: invoice.id })
            .catch(() => void 0);
        return invoice;
    }
};
exports.OrderRequestService = OrderRequestService;
exports.OrderRequestService = OrderRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(chat_card_service_1.ChatCardService)),
    __param(2, (0, common_1.Inject)(invoice_service_1.InvoiceService)),
    __param(3, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_card_service_1.ChatCardService,
        invoice_service_1.InvoiceService,
        notifications_service_1.NotificationsService])
], OrderRequestService);
//# sourceMappingURL=order-request.service.js.map