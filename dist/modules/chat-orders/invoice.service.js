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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let InvoiceService = class InvoiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    ref(prefix) {
        return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1e4)
            .toString()
            .padStart(4, '0')}`;
    }
    async createFromQuoteTx(tx, quote) {
        if (!quote.clientId)
            throw new common_1.BadRequestException('Quote has no client');
        if (!quote.listingId) {
            throw new common_1.BadRequestException('Quote has no listing to book');
        }
        if (!quote.conversationId) {
            throw new common_1.BadRequestException('Quote is not attached to a conversation');
        }
        const event = quote.eventId
            ? await tx.event.findUnique({
                where: { id: quote.eventId },
                select: { eventDate: true, location: true },
            })
            : null;
        const booking = await tx.booking.create({
            data: {
                clientId: quote.clientId,
                vendorId: quote.vendorId,
                listingId: quote.listingId,
                eventId: quote.eventId ?? null,
                status: client_1.BookingStatus.CONFIRMED,
                fulfilmentType: client_1.FulfilmentType.SERVICE,
                eventDate: event?.eventDate ?? new Date(),
                eventLocation: (event?.location ?? {}),
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
                notes: quote.paymentTerms ?? null,
                status: client_1.InvoiceStatus.ACCEPTED,
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
    async createDirectInvoiceTx(tx, args) {
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
                subtotal: new client_1.Prisma.Decimal(total),
                total: new client_1.Prisma.Decimal(total),
                notes: args.paymentTerms ?? null,
                status: client_1.InvoiceStatus.SENT,
                lineItems: {
                    create: args.lineItems.map((li, i) => ({
                        label: li.label,
                        amount: new client_1.Prisma.Decimal(li.amount),
                        sortOrder: i,
                    })),
                },
            },
        });
        return invoice;
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map