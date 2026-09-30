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
    private eventVendorUserIds;
    getOrCreateEventGroup(userId: string, eventId: string): Promise<({
        vendor: {
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
        } | null;
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
        vendor: {
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
        } | null;
        messages: ({
            sender: {
                id: string;
                name: string;
            };
        } & {
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
        vendor: {
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
        } | null;
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
    }>;
    markRead(conversationId: string, userId: string): Promise<{
        updated: number;
    }>;
    getMessages(conversationId: string, userId: string, take?: number, cursor?: string): Promise<({
        booking: {
            listing: {
                title: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        } | null;
        quote: ({
            lineItems: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                quoteId: string;
                label: string;
                amount: import("@prisma/client-runtime-utils").Decimal;
            }[];
        } & {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            version: number;
            vendorId: string;
            clientId: string | null;
            listingId: string | null;
            status: import("@prisma/client").$Enums.QuoteStatus;
            eventId: string | null;
            notes: string | null;
            bookingId: string | null;
            conversationId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            quoteNumber: string | null;
            paymentTerms: string | null;
            validUntil: Date;
            parentQuoteId: string | null;
            isLocked: boolean;
            lockedAt: Date | null;
        }) | null;
        invoice: ({
            lineItems: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                invoiceId: string;
                label: string;
                amount: import("@prisma/client-runtime-utils").Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            clientId: string;
            listingId: string | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            eventId: string | null;
            notes: string | null;
            bookingId: string | null;
            invoiceNumber: string;
            quoteId: string | null;
            conversationId: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            issuedAt: Date;
        }) | null;
        todo: ({
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
        }) | null;
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
    })[]>;
    isParticipant(conversationId: string, userId: string): Promise<boolean>;
    participantUserIds(conversationId: string): Promise<string[]>;
    private assertParticipant;
}
