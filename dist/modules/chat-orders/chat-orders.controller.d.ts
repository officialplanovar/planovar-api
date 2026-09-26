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
        };
        message: {
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
    }>;
    revise(req: Request, id: string, dto: ReviseQuoteDto): Promise<{
        quote: {
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
        };
        message: {
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
    }>;
    accept(req: Request, id: string): Promise<{
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
    }>;
    decline(req: Request, id: string): Promise<{
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
    }>;
    createOrder(req: Request, dto: CreateOrderRequestDto): Promise<{
        booking: {
            id: string;
            vendorId: string;
            createdAt: Date;
            updatedAt: Date;
            listingId: string;
            eventDate: Date;
            clientId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
            deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
            pickupAt: Date | null;
            returnAt: Date | null;
            notes: string | null;
            packageId: string | null;
            eventId: string | null;
        };
        message: {
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
    }>;
    acceptOrder(req: Request, bookingId: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    } | {
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
    }>;
    declineOrder(req: Request, bookingId: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    } | {
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
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            conversationId: string;
            createdBy: string;
            dueAt: Date | null;
        };
        message: {
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
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
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
