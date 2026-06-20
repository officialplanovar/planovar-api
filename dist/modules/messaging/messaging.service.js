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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
let MessagingService = class MessagingService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createDirectConversation(clientId, vendorId, bookingId) {
        if (bookingId) {
            const existing = await this.prisma.conversation.findFirst({
                where: { bookingId },
                include: { participants: true },
            });
            if (existing)
                return existing;
        }
        else {
            const existing = await this.prisma.conversation.findFirst({
                where: {
                    type: 'DIRECT',
                    clientId,
                    vendorId,
                    bookingId: null,
                },
                include: { participants: true },
            });
            if (existing)
                return existing;
        }
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            select: { userId: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return this.prisma.conversation.create({
            data: {
                type: 'DIRECT',
                clientId,
                vendorId,
                bookingId: bookingId ?? null,
                participants: {
                    create: [
                        { userId: clientId },
                        { userId: vendor.userId },
                    ],
                },
            },
            include: { participants: true },
        });
    }
    async createGroupConversation(clientId, eventId, groupName) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { clientId: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.clientId !== clientId) {
            throw new common_1.ForbiddenException('Event does not belong to you');
        }
        return this.prisma.conversation.create({
            data: {
                type: 'GROUP',
                clientId,
                eventId,
                groupName: groupName ?? null,
                participants: {
                    create: [{ userId: clientId }],
                },
            },
            include: { participants: true },
        });
    }
    async addGroupParticipant(conversationId, requesterId, userId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        if (conversation.type !== 'GROUP') {
            throw new common_1.BadRequestException('Conversation is not a group');
        }
        const isParticipant = conversation.participants.some((p) => p.userId === requesterId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant');
        const alreadyPresent = conversation.participants.some((p) => p.userId === userId);
        if (alreadyPresent)
            return { message: 'Already a participant' };
        return this.prisma.conversationParticipant.create({
            data: { conversationId, userId },
        });
    }
    async listConversations(userId) {
        const participations = await this.prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: { user: { select: { id: true, name: true, image: true } } },
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: { sender: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
            orderBy: { conversation: { lastMessageAt: 'desc' } },
        });
        return participations.map((p) => ({
            ...p.conversation,
            unreadCount: p.unreadCount,
            lastMessage: p.conversation.messages[0] ?? null,
        }));
    }
    async getConversation(conversationId, userId) {
        await this.assertParticipant(conversationId, userId);
        return this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, image: true } } },
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                    include: {
                        sender: { select: { id: true, name: true, image: true } },
                        attachments: true,
                    },
                },
            },
        });
    }
    async sendMessage(conversationId, senderId, dto) {
        await this.assertParticipant(conversationId, senderId);
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content: dto.content ?? null,
                    type: dto.type ?? client_1.MessageType.TEXT,
                    voiceUrl: dto.voiceUrl ?? null,
                    voiceDuration: dto.voiceDuration ?? null,
                    quoteId: dto.quoteId ?? null,
                    attachments: dto.attachments?.length
                        ? {
                            create: dto.attachments.map((a) => ({
                                url: a.url,
                                publicId: a.publicId ?? null,
                                fileName: a.fileName ?? null,
                                fileType: a.fileType,
                                fileSize: a.fileSize,
                            })),
                        }
                        : undefined,
                },
                include: {
                    sender: { select: { id: true, name: true, image: true } },
                    attachments: true,
                },
            }),
            this.prisma.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() },
            }),
            this.prisma.conversationParticipant.updateMany({
                where: { conversationId, userId: { not: senderId } },
                data: { unreadCount: { increment: 1 } },
            }),
        ]);
        await this.redis.del(redis_service_1.RedisService.keys.conversationMessages(conversationId));
        return message;
    }
    async markRead(conversationId, userId) {
        await this.assertParticipant(conversationId, userId);
        const now = new Date();
        const [, updated] = await this.prisma.$transaction([
            this.prisma.conversationParticipant.updateMany({
                where: { conversationId, userId },
                data: { unreadCount: 0, lastReadAt: now },
            }),
            this.prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    isRead: false,
                },
                data: { isRead: true, readAt: now },
            }),
        ]);
        return { updated: updated.count };
    }
    async getMessages(conversationId, userId, take = 50, cursor) {
        await this.assertParticipant(conversationId, userId);
        return this.prisma.message.findMany({
            where: {
                conversationId,
                ...(cursor ? { id: { lt: cursor } } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take,
            include: {
                sender: { select: { id: true, name: true, image: true } },
                attachments: true,
            },
        });
    }
    async isParticipant(conversationId, userId) {
        const p = await this.prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        return !!p;
    }
    async assertParticipant(conversationId, userId) {
        const ok = await this.isParticipant(conversationId, userId);
        if (!ok)
            throw new common_1.ForbiddenException('Not a participant in this conversation');
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map