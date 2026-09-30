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
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            conversationId: string;
            dueAt: Date | null;
            createdBy: string;
        };
        message: {
            type: import("@prisma/client").$Enums.MessageType;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            content: string | null;
            bookingId: string | null;
            isRead: boolean;
            readAt: Date | null;
            quoteId: string | null;
            conversationId: string;
            invoiceId: string | null;
            senderId: string;
            voiceUrl: string | null;
            voiceDuration: number | null;
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
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        conversationId: string;
        dueAt: Date | null;
        createdBy: string;
    })[]>;
    deleteTodo(userId: string, todoId: string): Promise<{
        deleted: boolean;
    }>;
}
