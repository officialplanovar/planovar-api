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
        attachments: {
            url: string;
            id: string;
            createdAt: Date;
            publicId: string | null;
            fileName: string | null;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
        sender: {
            id: string;
            name: string;
            image: string | null;
        };
    } & {
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        content: string | null;
        conversationId: string;
        senderId: string;
        voiceUrl: string | null;
        voiceDuration: number | null;
        quoteId: string | null;
        invoiceId: string | null;
        bookingId: string | null;
        todoId: string | null;
        isRead: boolean;
        readAt: Date | null;
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
