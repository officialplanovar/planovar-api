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
exports.ChatCardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const chat_realtime_service_1 = require("../../common/realtime/chat-realtime.service");
let ChatCardService = class ChatCardService {
    prisma;
    realtime;
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    async broadcast(messageId) {
        try {
            const msg = await this.prisma.message.findUnique({
                where: { id: messageId },
                include: {
                    conversation: { select: { participants: { select: { userId: true } } } },
                    sender: { select: { id: true, name: true, image: true } },
                    attachments: true,
                    quote: { include: { lineItems: { orderBy: { sortOrder: 'asc' } } } },
                    invoice: {
                        include: {
                            lineItems: { orderBy: { sortOrder: 'asc' } },
                        },
                    },
                    booking: {
                        select: {
                            id: true,
                            status: true,
                            fulfilmentType: true,
                            finalAmount: true,
                            listing: { select: { title: true } },
                        },
                    },
                    todo: { include: { assignments: true } },
                },
            });
            if (msg) {
                this.realtime.emitMessage(msg.conversationId, msg, msg.conversation.participants.map((p) => p.userId));
            }
        }
        catch {
        }
    }
    async broadcastMany(messageIds) {
        for (const id of messageIds)
            await this.broadcast(id);
    }
    async post(tx, args) {
        const message = await tx.message.create({
            data: {
                conversationId: args.conversationId,
                senderId: args.senderId,
                type: args.type,
                content: args.content ?? null,
                quoteId: args.quoteId ?? null,
                invoiceId: args.invoiceId ?? null,
                bookingId: args.bookingId ?? null,
                todoId: args.todoId ?? null,
                metadata: args.metadata ?? client_1.Prisma.JsonNull,
            },
        });
        await tx.conversation.update({
            where: { id: args.conversationId },
            data: { lastMessageAt: new Date() },
        });
        await tx.conversationParticipant.updateMany({
            where: { conversationId: args.conversationId, userId: { not: args.senderId } },
            data: { unreadCount: { increment: 1 } },
        });
        return message;
    }
};
exports.ChatCardService = ChatCardService;
exports.ChatCardService = ChatCardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(chat_realtime_service_1.ChatRealtimeService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_realtime_service_1.ChatRealtimeService])
], ChatCardService);
//# sourceMappingURL=chat-card.service.js.map