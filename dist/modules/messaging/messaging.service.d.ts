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
    createGroupConversation(clientId: string, eventId: string, groupName?: string): Promise<{
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
    addGroupParticipant(conversationId: string, requesterId: string, userId: string): Promise<{
        id: string;
        userId: string;
        unreadCount: number;
        conversationId: string;
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
    getConversation(conversationId: string, userId: string): Promise<({
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
    sendMessage(conversationId: string, senderId: string, dto: SendMessageDto): Promise<{
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
    markRead(conversationId: string, userId: string): Promise<{
        updated: number;
    }>;
    getMessages(conversationId: string, userId: string, take?: number, cursor?: string): Promise<({
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
    isParticipant(conversationId: string, userId: string): Promise<boolean>;
    private assertParticipant;
}
