import type { Request } from 'express';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    createConversation(req: Request, dto: CreateConversationDto): Promise<{
        participants: {
            id: string;
            userId: string;
            conversationId: string;
            unreadCount: number;
            lastReadAt: Date | null;
            joinedAt: Date;
        }[];
    } & {
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        bookingId: string | null;
        clientId: string;
        eventId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }>;
    listConversations(req: Request): Promise<{
        unreadCount: number;
        lastMessage: {
            sender: {
                id: string;
                name: string;
            };
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
        };
        messages: ({
            sender: {
                id: string;
                name: string;
            };
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
        })[];
        participants: ({
            user: {
                id: string;
                name: string;
                image: string | null;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
            unreadCount: number;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        bookingId: string | null;
        clientId: string;
        eventId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }[]>;
    getConversation(req: Request, id: string): Promise<({
        messages: ({
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
        })[];
        participants: ({
            user: {
                id: string;
                name: string;
                image: string | null;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
            unreadCount: number;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
    } & {
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        bookingId: string | null;
        clientId: string;
        eventId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }) | null>;
    getMessages(req: Request, id: string, take?: string, cursor?: string): Promise<({
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
    })[]>;
    sendMessage(req: Request, id: string, dto: SendMessageDto): Promise<{
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
    markRead(req: Request, id: string): Promise<{
        updated: number;
    }>;
    addParticipant(req: Request, id: string, userId: string): Promise<{
        id: string;
        userId: string;
        conversationId: string;
        unreadCount: number;
        lastReadAt: Date | null;
        joinedAt: Date;
    } | {
        message: string;
    }>;
}
