import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationType, MessageType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatCardService } from './chat-card.service';
import { CreateTodoDto } from './dto/create-todo.dto';

/**
 * To-do lists inside an event GROUP chat. Each assignee ticks off their own
 * task. To-dos exist only in group conversations (never DMs).
 */
@Injectable()
export class TodoService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatCardService) private readonly cards: ChatCardService,
  ) {}

  /** Assert the user is a member of a GROUP conversation. */
  private async assertGroupMember(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        type: true,
        participants: { where: { userId }, select: { userId: true } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.type !== ConversationType.GROUP) {
      throw new BadRequestException('To-dos are only available in event group chats');
    }
    if (conv.participants.length === 0) {
      throw new ForbiddenException('You are not a member of this chat');
    }
    return conv;
  }

  async createTodo(userId: string, dto: CreateTodoDto) {
    await this.assertGroupMember(dto.conversationId, userId);

    // Assignees must be members of the same group.
    const members = await this.prisma.conversationParticipant.findMany({
      where: { conversationId: dto.conversationId, userId: { in: dto.assigneeIds } },
      select: { userId: true },
    });
    const memberIds = new Set(members.map((m) => m.userId));
    const missing = dto.assigneeIds.filter((id) => !memberIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException('All assignees must be members of the chat');
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
        type: MessageType.TODO,
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

  /** The calling user ticks/unticks their own task on a to-do. */
  async toggleMyTask(userId: string, todoId: string) {
    const assignment = await this.prisma.todoAssignment.findUnique({
      where: { todoId_userId: { todoId, userId } },
    });
    if (!assignment) {
      throw new ForbiddenException('You have no task on this to-do');
    }
    const nowDone = !assignment.isDone;
    return this.prisma.todoAssignment.update({
      where: { id: assignment.id },
      data: { isDone: nowDone, doneAt: nowDone ? new Date() : null },
    });
  }

  async listForConversation(userId: string, conversationId: string) {
    await this.assertGroupMember(conversationId, userId);
    return this.prisma.todo.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      include: { assignments: true },
    });
  }

  /** Only the creator can delete a to-do (cascades its assignments). */
  async deleteTodo(userId: string, todoId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      select: { id: true, createdBy: true },
    });
    if (!todo) throw new NotFoundException('To-do not found');
    if (todo.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can delete this to-do');
    }
    await this.prisma.todo.delete({ where: { id: todoId } });
    return { deleted: true };
  }
}
