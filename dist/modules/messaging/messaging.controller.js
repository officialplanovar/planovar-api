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
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const messaging_service_1 = require("./messaging.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
let MessagingController = class MessagingController {
    messagingService;
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async createConversation(req, dto) {
        const userId = req.user.id;
        if (dto.type === 'DIRECT') {
            if (!dto.vendorId) {
                throw new Error('vendorId is required for DIRECT conversations');
            }
            return this.messagingService.createDirectConversation(userId, dto.vendorId, dto.bookingId);
        }
        if (!dto.eventId) {
            throw new Error('eventId is required for GROUP conversations');
        }
        return this.messagingService.createGroupConversation(userId, dto.eventId, dto.groupName);
    }
    listConversations(req) {
        return this.messagingService.listConversations(req.user.id);
    }
    getConversation(req, id) {
        return this.messagingService.getConversation(id, req.user.id);
    }
    getMessages(req, id, take, cursor) {
        const takeNum = take ? parseInt(take, 10) : 50;
        return this.messagingService.getMessages(id, req.user.id, takeNum, cursor);
    }
    sendMessage(req, id, dto) {
        return this.messagingService.sendMessage(id, req.user.id, dto);
    }
    markRead(req, id) {
        return this.messagingService.markRead(id, req.user.id);
    }
    addParticipant(req, id, userId) {
        return this.messagingService.addGroupParticipant(id, req.user.id, userId);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a DIRECT or GROUP conversation' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List the current user's conversations" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a conversation with last 50 messages' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated messages for a conversation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, type: 'string', description: 'Message UUID cursor for pagination' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to a conversation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all messages in a conversation as read' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)(':id/participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a participant to a GROUP conversation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId'],
            properties: { userId: { type: 'string' } },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "addParticipant", null);
exports.MessagingController = MessagingController = __decorate([
    (0, swagger_1.ApiTags)('messaging'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('conversations'),
    __param(0, (0, common_1.Inject)(messaging_service_1.MessagingService)),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map