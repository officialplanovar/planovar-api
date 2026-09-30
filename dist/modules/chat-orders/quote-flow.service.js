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
exports.QuoteFlowService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const chat_card_service_1 = require("./chat-card.service");
const invoice_service_1 = require("./invoice.service");
let QuoteFlowService = class QuoteFlowService {
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
    quoteNumber() {
        return `QT-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1e4)
            .toString()
            .padStart(4, '0')}`;
    }
    async vendorFor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, userId: true, businessName: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return vendor;
    }
    async getOrCreateDirect(clientId, vendor) {
        const existing = await this.prisma.conversation.findFirst({
            where: { type: 'DIRECT', clientId, vendorId: vendor.id },
            select: { id: true },
        });
        if (existing)
            return existing.id;
        const created = await this.prisma.conversation.create({
            data: {
                type: 'DIRECT',
                clientId,
                vendorId: vendor.id,
                participants: {
                    create: [{ userId: clientId }, { userId: vendor.userId }],
                },
            },
            select: { id: true },
        });
        return created.id;
    }
    async sendQuote(vendorUserId, dto) {
        const vendor = await this.vendorFor(vendorUserId);
        const conversationId = await this.getOrCreateDirect(dto.clientId, vendor);
        const total = dto.lineItems.reduce((s, li) => s + li.amount, 0);
        const validUntil = dto.validUntil
            ? new Date(dto.validUntil)
            : new Date(Date.now() + (dto.validForDays ?? 7) * 86_400_000);
        const result = await this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.create({
                data: {
                    quoteNumber: this.quoteNumber(),
                    vendorId: vendor.id,
                    clientId: dto.clientId,
                    conversationId,
                    listingId: dto.listingId,
                    eventId: dto.eventId ?? null,
                    amount: new client_1.Prisma.Decimal(total),
                    description: dto.description ?? null,
                    notes: dto.notes ?? null,
                    paymentTerms: dto.paymentTerms ?? null,
                    validUntil,
                    status: client_1.QuoteStatus.PENDING,
                    version: 1,
                    isActive: true,
                    lineItems: {
                        create: dto.lineItems.map((li, i) => ({
                            label: li.label,
                            amount: new client_1.Prisma.Decimal(li.amount),
                            sortOrder: i,
                        })),
                    },
                },
                include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
            });
            const message = await this.cards.post(tx, {
                conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.QUOTE,
                quoteId: quote.id,
                content: dto.description ?? null,
                metadata: { amount: String(total), version: '1' },
            });
            return { quote, message };
        });
        await this.cards.broadcast(result.message.id);
        void this.notifications
            .create(dto.clientId, client_1.NotificationType.QUOTE_RECEIVED, 'New quote received', `${vendor.businessName} sent you a quote — ₦${total.toLocaleString()}`, { quoteId: result.quote.id })
            .catch(() => void 0);
        return result;
    }
    async reviseQuote(vendorUserId, quoteId, dto) {
        const vendor = await this.vendorFor(vendorUserId);
        const current = await this.prisma.quote.findUnique({
            where: { id: quoteId },
        });
        if (!current)
            throw new common_1.NotFoundException('Quote not found');
        if (current.vendorId !== vendor.id) {
            throw new common_1.ForbiddenException('Not your quote');
        }
        if (!current.isActive) {
            throw new common_1.ConflictException('Only the active quote can be revised — this one was superseded, accepted or declined');
        }
        if (!current.conversationId || !current.clientId) {
            throw new common_1.BadRequestException('Quote is not attached to a conversation');
        }
        const total = dto.lineItems.reduce((s, li) => s + li.amount, 0);
        const validUntil = dto.validUntil
            ? new Date(dto.validUntil)
            : current.validUntil;
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.quote.update({
                where: { id: current.id },
                data: { status: client_1.QuoteStatus.SUPERSEDED, isActive: false },
            });
            const quote = await tx.quote.create({
                data: {
                    quoteNumber: this.quoteNumber(),
                    vendorId: vendor.id,
                    clientId: current.clientId,
                    conversationId: current.conversationId,
                    listingId: current.listingId,
                    eventId: current.eventId,
                    amount: new client_1.Prisma.Decimal(total),
                    description: dto.description ?? current.description,
                    notes: dto.notes ?? null,
                    paymentTerms: dto.paymentTerms ?? null,
                    validUntil,
                    status: client_1.QuoteStatus.PENDING,
                    version: current.version + 1,
                    isActive: true,
                    parentQuoteId: current.id,
                    lineItems: {
                        create: dto.lineItems.map((li, i) => ({
                            label: li.label,
                            amount: new client_1.Prisma.Decimal(li.amount),
                            sortOrder: i,
                        })),
                    },
                },
                include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
            });
            const message = await this.cards.post(tx, {
                conversationId: current.conversationId,
                senderId: vendorUserId,
                type: client_1.MessageType.QUOTE_REVISED,
                quoteId: quote.id,
                content: dto.description ?? null,
                metadata: { amount: String(total), version: String(quote.version) },
            });
            return { quote, message };
        });
        await this.cards.broadcast(result.message.id);
        void this.notifications
            .create(current.clientId, client_1.NotificationType.QUOTE_RECEIVED, 'Quote updated', `${vendor.businessName} sent a revised quote (v${result.quote.version}) — ₦${total.toLocaleString()}`, { quoteId: result.quote.id })
            .catch(() => void 0);
        return result;
    }
    async acceptQuote(clientUserId, quoteId) {
        const quote = await this.prisma.quote.findUnique({
            where: { id: quoteId },
            include: {
                lineItems: { orderBy: { sortOrder: 'asc' } },
                vendor: { select: { userId: true, businessName: true } },
            },
        });
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        if (quote.clientId !== clientUserId) {
            throw new common_1.ForbiddenException('Not your quote');
        }
        if (!quote.isActive || quote.status !== client_1.QuoteStatus.PENDING) {
            throw new common_1.ConflictException('This quote can no longer be accepted');
        }
        if (quote.validUntil < new Date()) {
            await this.prisma.quote.update({
                where: { id: quote.id },
                data: { status: client_1.QuoteStatus.EXPIRED, isActive: false },
            });
            throw new common_1.ConflictException('This quote has expired — ask the vendor to re-issue it');
        }
        if (!quote.conversationId) {
            throw new common_1.BadRequestException('Quote is not attached to a conversation');
        }
        const { invoice, cardIds } = await this.prisma.$transaction(async (tx) => {
            await tx.quote.update({
                where: { id: quote.id },
                data: {
                    status: client_1.QuoteStatus.ACCEPTED,
                    isActive: false,
                    isLocked: true,
                    lockedAt: new Date(),
                },
            });
            const inv = await this.invoices.createFromQuoteTx(tx, {
                id: quote.id,
                clientId: quote.clientId,
                vendorId: quote.vendorId,
                listingId: quote.listingId,
                eventId: quote.eventId,
                conversationId: quote.conversationId,
                amount: quote.amount,
                paymentTerms: quote.paymentTerms,
                lineItems: quote.lineItems.map((li) => ({
                    label: li.label,
                    amount: li.amount,
                    sortOrder: li.sortOrder,
                })),
            });
            const acceptedCard = await this.cards.post(tx, {
                conversationId: quote.conversationId,
                senderId: clientUserId,
                type: client_1.MessageType.QUOTE_ACCEPTED,
                quoteId: quote.id,
            });
            const invoiceCard = await this.cards.post(tx, {
                conversationId: quote.conversationId,
                senderId: quote.vendor.userId,
                type: client_1.MessageType.INVOICE,
                invoiceId: inv.id,
                bookingId: inv.bookingId,
                metadata: {
                    invoiceNumber: inv.invoiceNumber,
                    total: inv.total.toString(),
                },
            });
            return { invoice: inv, cardIds: [acceptedCard.id, invoiceCard.id] };
        });
        await this.cards.broadcastMany(cardIds);
        void this.notifications
            .create(quote.vendor.userId, client_1.NotificationType.QUOTE_ACCEPTED, 'Quote accepted 🎉', `Your ₦${quote.amount.toNumber().toLocaleString()} quote was accepted — invoice ${invoice.invoiceNumber} created`, { quoteId: quote.id, invoiceId: invoice.id })
            .catch(() => void 0);
        return invoice;
    }
    async declineQuote(clientUserId, quoteId) {
        const quote = await this.prisma.quote.findUnique({
            where: { id: quoteId },
            include: { vendor: { select: { userId: true } } },
        });
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        if (quote.clientId !== clientUserId) {
            throw new common_1.ForbiddenException('Not your quote');
        }
        if (!quote.isActive || quote.status !== client_1.QuoteStatus.PENDING) {
            throw new common_1.ConflictException('This quote can no longer be declined');
        }
        const { updated, cardId } = await this.prisma.$transaction(async (tx) => {
            const q = await tx.quote.update({
                where: { id: quote.id },
                data: { status: client_1.QuoteStatus.REJECTED, isActive: false },
            });
            let cid = null;
            if (quote.conversationId) {
                const card = await this.cards.post(tx, {
                    conversationId: quote.conversationId,
                    senderId: clientUserId,
                    type: client_1.MessageType.QUOTE_DECLINED,
                    quoteId: quote.id,
                });
                cid = card.id;
            }
            return { updated: q, cardId: cid };
        });
        if (cardId)
            await this.cards.broadcast(cardId);
        void this.notifications
            .create(quote.vendor.userId, client_1.NotificationType.QUOTE_REJECTED, 'Quote declined', 'A client declined your quote — the conversation stays open', { quoteId: quote.id })
            .catch(() => void 0);
        return updated;
    }
};
exports.QuoteFlowService = QuoteFlowService;
exports.QuoteFlowService = QuoteFlowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(chat_card_service_1.ChatCardService)),
    __param(2, (0, common_1.Inject)(invoice_service_1.InvoiceService)),
    __param(3, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_card_service_1.ChatCardService,
        invoice_service_1.InvoiceService,
        notifications_service_1.NotificationsService])
], QuoteFlowService);
//# sourceMappingURL=quote-flow.service.js.map