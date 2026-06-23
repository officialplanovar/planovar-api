import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { MessageType } from '@prisma/client';
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagingService;
    private readonly logger;
    server: Server;
    constructor(messagingService: MessagingService);
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
            name: string;
            image: string | null;
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
        type: import("@prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        quoteId: string | null;
        conversationId: string;
        senderId: string;
        content: string | null;
        voiceUrl: string | null;
        voiceDuration: number | null;
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
