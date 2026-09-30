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
    getOrCreateEventGroup(req: Request, eventId: string): Promise<({
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
    listConversations(req: Request): Promise<{
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
    getConversation(req: Request, id: string): Promise<({
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
    getMessages(req: Request, id: string, take?: string, cursor?: string): Promise<({
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
