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
        id: string;
        vendorId: string | null;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ConversationType;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }>;
    getOrCreateEventGroup(req: Request, eventId: string): Promise<({
        vendor: {
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
        } | null;
        messages: ({
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
        })[];
        participants: ({
            user: {
                id: string;
                image: string | null;
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
        id: string;
        vendorId: string | null;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ConversationType;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }) | null>;
    listConversations(req: Request): Promise<{
        unreadCount: number;
        lastMessage: {
            sender: {
                id: string;
                name: string;
            };
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
        })[];
        participants: ({
            user: {
                id: string;
                image: string | null;
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
        id: string;
        vendorId: string | null;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ConversationType;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }[]>;
    getConversation(req: Request, id: string): Promise<({
        vendor: {
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
        } | null;
        messages: ({
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
        })[];
        participants: ({
            user: {
                id: string;
                image: string | null;
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
        id: string;
        vendorId: string | null;
        createdAt: Date;
        type: import("@prisma/client").$Enums.ConversationType;
        clientId: string;
        eventId: string | null;
        bookingId: string | null;
        groupName: string | null;
        lastMessageAt: Date | null;
    }) | null>;
    getMessages(req: Request, id: string, take?: string, cursor?: string): Promise<({
        booking: {
            id: string;
            listing: {
                title: string;
            };
            status: import("@prisma/client").$Enums.BookingStatus;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        } | null;
        quote: ({
            lineItems: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                amount: import("@prisma/client-runtime-utils").Decimal;
                quoteId: string;
                label: string;
            }[];
        } & {
            id: string;
            description: string | null;
            vendorId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            listingId: string | null;
            clientId: string | null;
            status: import("@prisma/client").$Enums.QuoteStatus;
            notes: string | null;
            eventId: string | null;
            bookingId: string | null;
            quoteNumber: string | null;
            conversationId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paymentTerms: string | null;
            validUntil: Date;
            version: number;
            parentQuoteId: string | null;
            isLocked: boolean;
            lockedAt: Date | null;
        }) | null;
        invoice: ({
            lineItems: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                amount: import("@prisma/client-runtime-utils").Decimal;
                label: string;
                invoiceId: string;
            }[];
        } & {
            id: string;
            vendorId: string;
            createdAt: Date;
            updatedAt: Date;
            listingId: string | null;
            clientId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: import("@prisma/client-runtime-utils").Decimal;
            notes: string | null;
            eventId: string | null;
            bookingId: string | null;
            conversationId: string;
            quoteId: string | null;
            invoiceNumber: string;
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
            id: string;
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            conversationId: string;
            createdBy: string;
            dueAt: Date | null;
        }) | null;
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
    })[]>;
    sendMessage(req: Request, id: string, dto: SendMessageDto): Promise<{
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
