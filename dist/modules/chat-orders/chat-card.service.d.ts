import { MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRealtimeService } from '../../common/realtime/chat-realtime.service';
export declare class ChatCardService {
    private readonly prisma;
    private readonly realtime;
    constructor(prisma: PrismaService, realtime: ChatRealtimeService);
    broadcast(messageId: string): Promise<void>;
    broadcastMany(messageIds: string[]): Promise<void>;
    post(tx: Prisma.TransactionClient, args: {
        conversationId: string;
        senderId: string;
        type: MessageType;
        content?: string | null;
        quoteId?: string | null;
        invoiceId?: string | null;
        bookingId?: string | null;
        todoId?: string | null;
        metadata?: Prisma.InputJsonValue;
    }): Promise<{
        type: import("@prisma/client").$Enums.MessageType;
        metadata: Prisma.JsonValue | null;
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
    }>;
}
