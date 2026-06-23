import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagingService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    createDirectConversation(clientId: string, vendorId: string, bookingId?: string): Promise<{
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
    createGroupConversation(clientId: string, eventId: string, groupName?: string): Promise<{
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
    addGroupParticipant(conversationId: string, requesterId: string, userId: string): Promise<{
        id: string;
        userId: string;
        conversationId: string;
        unreadCount: number;
        lastReadAt: Date | null;
        joinedAt: Date;
    } | {
        message: string;
    }>;
    listConversations(userId: string): Promise<{
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
    getConversation(conversationId: string, userId: string): Promise<({
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
    sendMessage(conversationId: string, senderId: string, dto: SendMessageDto): Promise<{
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
    markRead(conversationId: string, userId: string): Promise<{
        updated: number;
    }>;
    getMessages(conversationId: string, userId: string, take?: number, cursor?: string): Promise<({
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
    isParticipant(conversationId: string, userId: string): Promise<boolean>;
    private assertParticipant;
}
