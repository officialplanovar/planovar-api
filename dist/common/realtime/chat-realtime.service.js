"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChatRealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRealtimeService = void 0;
const common_1 = require("@nestjs/common");
let ChatRealtimeService = ChatRealtimeService_1 = class ChatRealtimeService {
    logger = new common_1.Logger(ChatRealtimeService_1.name);
    server;
    setServer(server) {
        this.server = server;
    }
    static userRoom(userId) {
        return `user:${userId}`;
    }
    emitMessage(conversationId, message, participantUserIds = []) {
        if (!this.server)
            return;
        this.server.to(conversationId).emit('message', message);
        for (const userId of participantUserIds) {
            this.server.to(ChatRealtimeService_1.userRoom(userId)).emit('message', message);
        }
    }
};
exports.ChatRealtimeService = ChatRealtimeService;
exports.ChatRealtimeService = ChatRealtimeService = ChatRealtimeService_1 = __decorate([
    (0, common_1.Injectable)()
], ChatRealtimeService);
//# sourceMappingURL=chat-realtime.service.js.map