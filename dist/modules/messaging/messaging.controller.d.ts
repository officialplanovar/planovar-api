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
    getOrCreateEventGroup(req: Request, eventId: string): Promise<({
        vendor: {
            businessName: string;
            logoUrl: string | null;
            coverUrl: string | null;
        } | null;
        messages: ({
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
    listConversations(req: Request): Promise<{
        unreadCount: number;
        lastMessage: {
            sender: {
                id: string;
                name: string;
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
        };
        vendor: {
            businessName: string;
            logoUrl: string | null;
            coverUrl: string | null;
        } | null;
        messages: ({
            sender: {
                id: string;
                name: string;
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
        vendor: {
            businessName: string;
            logoUrl: string | null;
            coverUrl: string | null;
        } | null;
        messages: ({
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
        quote: ({
            lineItems: {
                id: string;
                createdAt: Date;
                quoteId: string;
                sortOrder: number;
                amount: import("@prisma/client-runtime-utils").Decimal;
                label: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            version: number;
            vendorId: string;
            status: import("@prisma/client").$Enums.QuoteStatus;
            description: string | null;
            conversationId: string | null;
            bookingId: string | null;
            clientId: string | null;
            eventId: string | null;
            listingId: string | null;
            notes: string | null;
            quoteNumber: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
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
                invoiceId: string;
                sortOrder: number;
                amount: import("@prisma/client-runtime-utils").Decimal;
                label: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: import("@prisma/client-runtime-utils").Decimal;
            conversationId: string;
            quoteId: string | null;
            bookingId: string | null;
            clientId: string;
            eventId: string | null;
            listingId: string | null;
            notes: string | null;
            invoiceNumber: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            issuedAt: Date;
        }) | null;
        booking: {
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            listing: {
                title: string;
            };
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        } | null;
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
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            conversationId: string;
            createdBy: string;
            dueAt: Date | null;
        }) | null;
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
    })[]>;
    sendMessage(req: Request, id: string, dto: SendMessageDto): Promise<{
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
