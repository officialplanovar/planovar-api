import { PrismaService } from '../../prisma/prisma.service';
import { ChatCardService } from './chat-card.service';
import { CreateTodoDto } from './dto/create-todo.dto';
export declare class TodoService {
    private readonly prisma;
    private readonly cards;
    constructor(prisma: PrismaService, cards: ChatCardService);
    private assertGroupMember;
    createTodo(userId: string, dto: CreateTodoDto): Promise<{
        todo: {
            assignments: {
                id: string;
                createdAt: Date;
                userId: string;
                todoId: string;
                isDone: boolean;
                doneAt: Date | null;
            }[];
        } & {
            id: string;
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            conversationId: string;
            createdBy: string;
            dueAt: Date | null;
        };
        message: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.MessageType;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            content: string | null;
            isRead: boolean;
            readAt: Date | null;
            bookingId: string | null;
            conversationId: string;
            quoteId: string | null;
            invoiceId: string | null;
            voiceUrl: string | null;
            voiceDuration: number | null;
            senderId: string;
            todoId: string | null;
        };
    }>;
    toggleMyTask(userId: string, todoId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        todoId: string;
        isDone: boolean;
        doneAt: Date | null;
    }>;
    listForConversation(userId: string, conversationId: string): Promise<({
        assignments: {
            id: string;
            createdAt: Date;
            userId: string;
            todoId: string;
            isDone: boolean;
            doneAt: Date | null;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        conversationId: string;
        createdBy: string;
        dueAt: Date | null;
    })[]>;
    deleteTodo(userId: string, todoId: string): Promise<{
        deleted: boolean;
    }>;
}
