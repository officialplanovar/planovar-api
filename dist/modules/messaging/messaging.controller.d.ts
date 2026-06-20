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
            unreadCount: number;
            conversationId: string;
            lastReadAt: Date | null;
            joinedAt: Date;
        }[];
    } & {
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
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
            content: string | null;
            isRead: boolean;
            readAt: Date | null;
            conversationId: string;
            quoteId: string | null;
            voiceUrl: string | null;
            voiceDuration: number | null;
            senderId: string;
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
            content: string | null;
            isRead: boolean;
            readAt: Date | null;
            conversationId: string;
            quoteId: string | null;
            voiceUrl: string | null;
            voiceDuration: number | null;
            senderId: string;
        })[];
        participants: ({
            user: {
                image: string | null;
                id: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            unreadCount: number;
            conversationId: string;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }[]>;
    getConversation(req: Request, id: string): Promise<({
        messages: ({
            attachments: {
                url: string;
                publicId: string | null;
                fileName: string | null;
                id: string;
                createdAt: Date;
                fileType: string;
                fileSize: number;
                messageId: string;
            }[];
            sender: {
                image: string | null;
                id: string;
                name: string;
            };
        } & {
            type: import("@prisma/client").$Enums.MessageType;
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            content: string | null;
            isRead: boolean;
            readAt: Date | null;
            conversationId: string;
            quoteId: string | null;
            voiceUrl: string | null;
            voiceDuration: number | null;
            senderId: string;
        })[];
        participants: ({
            user: {
                image: string | null;
                id: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            unreadCount: number;
            conversationId: string;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
    } & {
        type: import("@prisma/client").$Enums.ConversationType;
        id: string;
        createdAt: Date;
        vendorId: string | null;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }) | null>;
    getMessages(req: Request, id: string, take?: string, cursor?: string): Promise<({
        attachments: {
            url: string;
            publicId: string | null;
            fileName: string | null;
            id: string;
            createdAt: Date;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
        sender: {
            image: string | null;
            id: string;
            name: string;
        };
    } & {
        type: import("@prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        content: string | null;
        isRead: boolean;
        readAt: Date | null;
        conversationId: string;
        quoteId: string | null;
        voiceUrl: string | null;
        voiceDuration: number | null;
        senderId: string;
    })[]>;
    sendMessage(req: Request, id: string, dto: SendMessageDto): Promise<{
        attachments: {
            url: string;
            publicId: string | null;
            fileName: string | null;
            id: string;
            createdAt: Date;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
        sender: {
            image: string | null;
            id: string;
            name: string;
        };
    } & {
        type: import("@prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        content: string | null;
        isRead: boolean;
        readAt: Date | null;
        conversationId: string;
        quoteId: string | null;
        voiceUrl: string | null;
        voiceDuration: number | null;
        senderId: string;
    }>;
    markRead(req: Request, id: string): Promise<{
        updated: number;
    }>;
    addParticipant(req: Request, id: string, userId: string): Promise<{
        id: string;
        userId: string;
        unreadCount: number;
        conversationId: string;
        lastReadAt: Date | null;
        joinedAt: Date;
    } | {
        message: string;
    }>;
}
