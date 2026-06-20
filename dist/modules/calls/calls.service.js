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
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const livekit_server_sdk_1 = require("livekit-server-sdk");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const messaging_service_1 = require("../messaging/messaging.service");
let CallsService = class CallsService {
    prisma;
    config;
    messaging;
    constructor(prisma, config, messaging) {
        this.prisma = prisma;
        this.config = config;
        this.messaging = messaging;
    }
    async createToken(userId, conversationId) {
        const isParticipant = await this.messaging.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException('Not a participant in this conversation');
        }
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, vendor: { select: { subscriptionTier: true } } },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        if (conv.vendor?.subscriptionTier !== client_1.SubscriptionTier.GOLD) {
            throw new common_1.ForbiddenException('Voice calling is available on the Gold plan only');
        }
        const url = this.config.get('LIVEKIT_URL');
        const apiKey = this.config.get('LIVEKIT_API_KEY');
        const apiSecret = this.config.get('LIVEKIT_API_SECRET');
        if (!url || !apiKey || !apiSecret) {
            throw new common_1.ServiceUnavailableException('Voice calling is not configured (LIVEKIT_* env missing)');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });
        const roomName = `conv_${conversationId}`;
        const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity: userId,
            name: user?.name ?? 'User',
            ttl: '1h',
        });
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });
        return { url, token: await at.toJwt(), roomName };
    }
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(config_1.ConfigService)),
    __param(2, (0, common_1.Inject)(messaging_service_1.MessagingService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        messaging_service_1.MessagingService])
], CallsService);
//# sourceMappingURL=calls.service.js.map