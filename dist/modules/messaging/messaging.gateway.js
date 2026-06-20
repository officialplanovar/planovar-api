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
var MessagingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_config_1 = require("../../auth/auth.config");
const messaging_service_1 = require("./messaging.service");
const client_1 = require("@prisma/client");
let MessagingGateway = MessagingGateway_1 = class MessagingGateway {
    messagingService;
    logger = new common_1.Logger(MessagingGateway_1.name);
    server;
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async handleConnection(client) {
        try {
            const headers = new Headers(client.handshake.headers);
            const authToken = client.handshake.auth?.token;
            if (authToken)
                headers.set('authorization', `Bearer ${authToken}`);
            const session = await auth_config_1.auth.api.getSession({ headers });
            if (!session?.user) {
                client.emit('error', { message: 'Unauthorized' });
                client.disconnect(true);
                return;
            }
            client.data.userId = session.user.id;
            client.emit('connected', { userId: session.user.id });
            this.logger.log(`Client connected: ${session.user.id}`);
        }
        catch (err) {
            this.logger.error('Connection error', err);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.data.userId ?? client.id}`);
    }
    async handleJoin(client, payload) {
        const userId = client.data.userId;
        const { conversationId } = payload;
        const ok = await this.messagingService.isParticipant(conversationId, userId);
        if (!ok) {
            client.emit('error', { message: 'Not a participant in this conversation' });
            return;
        }
        await client.join(conversationId);
        client.emit('joined', { conversationId });
    }
    async handleLeave(client, payload) {
        await client.leave(payload.conversationId);
    }
    async handleMessage(client, payload) {
        const userId = client.data.userId;
        const savedMessage = await this.messagingService.sendMessage(payload.conversationId, userId, {
            content: payload.content,
            type: payload.type ?? client_1.MessageType.TEXT,
            voiceUrl: payload.voiceUrl,
            voiceDuration: payload.voiceDuration,
            quoteId: payload.quoteId,
            attachments: payload.attachments,
        });
        this.server.to(payload.conversationId).emit('message', savedMessage);
        return savedMessage;
    }
    handleCallInvite(client, payload) {
        const userId = client.data.userId;
        client.to(payload.conversationId).emit('call:incoming', {
            conversationId: payload.conversationId,
            roomName: payload.roomName,
            fromUserId: userId,
        });
    }
    handleCallEnd(client, payload) {
        client.to(payload.conversationId).emit('call:ended', {
            conversationId: payload.conversationId,
        });
    }
    handleTyping(client, payload) {
        const userId = client.data.userId;
        client.to(payload.conversationId).emit('typing', {
            userId,
            isTyping: payload.isTyping,
        });
    }
    async handleRead(client, payload) {
        const userId = client.data.userId;
        await this.messagingService.markRead(payload.conversationId, userId);
        this.server.to(payload.conversationId).emit('read', { userId });
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:invite'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleCallInvite", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:end'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleCallEnd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleRead", null);
exports.MessagingGateway = MessagingGateway = MessagingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/chat' }),
    __param(0, (0, common_1.Inject)(messaging_service_1.MessagingService)),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map