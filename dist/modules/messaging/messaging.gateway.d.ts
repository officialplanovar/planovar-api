import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRealtimeService } from '../../common/realtime/chat-realtime.service';
import { MessagingService } from './messaging.service';
import { MessageType } from '@prisma/client';
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly messagingService;
    private readonly realtime;
    private readonly logger;
    server: Server;
    constructor(messagingService: MessagingService, realtime: ChatRealtimeService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, payload: {
        conversationId: string;
    }): Promise<void>;
    handleLeave(client: Socket, payload: {
        conversationId: string;
    }): Promise<void>;
    handleMessage(client: Socket, payload: {
        conversationId: string;
        content?: string;
        type?: MessageType;
        voiceUrl?: string;
        voiceDuration?: number;
        quoteId?: string;
        attachments?: Array<{
            url: string;
            publicId?: string;
            fileName?: string;
            fileType: string;
            fileSize: number;
        }>;
    }): Promise<{
        sender: {
            id: string;
            image: string | null;
            name: string;
        };
        attachments: {
            id: string;
            createdAt: Date;
            url: string;
            publicId: string | null;
            fileName: string | null;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
    } & {
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
    }>;
    handleCallInvite(client: Socket, payload: {
        conversationId: string;
        roomName?: string;
    }): void;
    handleCallEnd(client: Socket, payload: {
        conversationId: string;
    }): void;
    handleTyping(client: Socket, payload: {
        conversationId: string;
        isTyping: boolean;
    }): void;
    handleRead(client: Socket, payload: {
        conversationId: string;
    }): Promise<void>;
}
