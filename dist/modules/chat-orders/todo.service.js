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
exports.TodoService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const chat_card_service_1 = require("./chat-card.service");
let TodoService = class TodoService {
    prisma;
    cards;
    constructor(prisma, cards) {
        this.prisma = prisma;
        this.cards = cards;
    }
    async assertGroupMember(conversationId, userId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            select: {
                id: true,
                type: true,
                participants: { where: { userId }, select: { userId: true } },
            },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        if (conv.type !== client_1.ConversationType.GROUP) {
            throw new common_1.BadRequestException('To-dos are only available in event group chats');
        }
        if (conv.participants.length === 0) {
            throw new common_1.ForbiddenException('You are not a member of this chat');
        }
        return conv;
    }
    async createTodo(userId, dto) {
        await this.assertGroupMember(dto.conversationId, userId);
        const members = await this.prisma.conversationParticipant.findMany({
            where: { conversationId: dto.conversationId, userId: { in: dto.assigneeIds } },
            select: { userId: true },
        });
        const memberIds = new Set(members.map((m) => m.userId));
        const missing = dto.assigneeIds.filter((id) => !memberIds.has(id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException('All assignees must be members of the chat');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const todo = await tx.todo.create({
                data: {
                    conversationId: dto.conversationId,
                    createdBy: userId,
                    title: dto.title,
                    description: dto.description ?? null,
                    dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
                    assignments: {
                        create: dto.assigneeIds.map((uid) => ({ userId: uid })),
                    },
                },
                include: { assignments: true },
            });
            const message = await this.cards.post(tx, {
                conversationId: dto.conversationId,
                senderId: userId,
                type: client_1.MessageType.TODO,
                todoId: todo.id,
                content: dto.title,
                metadata: {
                    title: dto.title,
                    assignees: String(dto.assigneeIds.length),
                },
            });
            return { todo, message };
        });
        await this.cards.broadcast(result.message.id);
        return result;
    }
    async toggleMyTask(userId, todoId) {
        const assignment = await this.prisma.todoAssignment.findUnique({
            where: { todoId_userId: { todoId, userId } },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('You have no task on this to-do');
        }
        const nowDone = !assignment.isDone;
        return this.prisma.todoAssignment.update({
            where: { id: assignment.id },
            data: { isDone: nowDone, doneAt: nowDone ? new Date() : null },
        });
    }
    async listForConversation(userId, conversationId) {
        await this.assertGroupMember(conversationId, userId);
        return this.prisma.todo.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            include: { assignments: true },
        });
    }
    async deleteTodo(userId, todoId) {
        const todo = await this.prisma.todo.findUnique({
            where: { id: todoId },
            select: { id: true, createdBy: true },
        });
        if (!todo)
            throw new common_1.NotFoundException('To-do not found');
        if (todo.createdBy !== userId) {
            throw new common_1.ForbiddenException('Only the creator can delete this to-do');
        }
        await this.prisma.todo.delete({ where: { id: todoId } });
        return { deleted: true };
    }
};
exports.TodoService = TodoService;
exports.TodoService = TodoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(chat_card_service_1.ChatCardService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_card_service_1.ChatCardService])
], TodoService);
//# sourceMappingURL=todo.service.js.map