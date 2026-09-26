import type { Request } from 'express';
import { FulfilmentService } from './fulfilment.service';
import { OrderRequestService } from './order-request.service';
import { QuoteFlowService } from './quote-flow.service';
import { TodoService } from './todo.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { PostUpdateDto, SubmitReviewDto } from './dto/fulfilment.dto';
import { ReviseQuoteDto } from './dto/revise-quote.dto';
import { SendQuoteDto } from './dto/send-quote.dto';
export declare class ChatOrdersController {
    private readonly quotes;
    private readonly orders;
    private readonly todos;
    private readonly fulfilment;
    constructor(quotes: QuoteFlowService, orders: OrderRequestService, todos: TodoService, fulfilment: FulfilmentService);
    sendQuote(req: Request, dto: SendQuoteDto): Promise<{
        quote: {
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
        };
        message: {
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
    }>;
    revise(req: Request, id: string, dto: ReviseQuoteDto): Promise<{
        quote: {
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
        };
        message: {
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
    }>;
    accept(req: Request, id: string): Promise<{
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
    }>;
    decline(req: Request, id: string): Promise<{
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
    }>;
    createOrder(req: Request, dto: CreateOrderRequestDto): Promise<{
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            clientId: string;
            eventId: string | null;
            listingId: string;
            eventDate: Date;
            packageId: string | null;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
            deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
            pickupAt: Date | null;
            returnAt: Date | null;
            notes: string | null;
        };
        message: {
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
    }>;
    acceptOrder(req: Request, bookingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        clientId: string;
        eventId: string | null;
        listingId: string;
        eventDate: Date;
        packageId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
    } | {
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
    }>;
    declineOrder(req: Request, bookingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        clientId: string;
        eventId: string | null;
        listingId: string;
        eventDate: Date;
        packageId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
    } | {
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
    }>;
    createTodo(req: Request, dto: CreateTodoDto): Promise<{
        todo: {
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
        };
        message: {
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
    }>;
    toggleTodo(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        todoId: string;
        isDone: boolean;
        doneAt: Date | null;
    }>;
    listTodos(req: Request, id: string): Promise<({
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
    })[]>;
    deleteTodo(req: Request, id: string): Promise<{
        deleted: boolean;
    }>;
    postUpdate(req: Request, id: string, dto: PostUpdateDto): Promise<{
        posted: boolean;
    }>;
    markDelivered(req: Request, id: string): Promise<{
        completed: boolean;
    }>;
    confirmReturn(req: Request, id: string): Promise<{
        completed: boolean;
    }>;
    submitReview(req: Request, id: string, dto: SubmitReviewDto): Promise<{
        submitted: boolean;
    }>;
}
