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
        };
        message: {
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
    }>;
    revise(req: Request, id: string, dto: ReviseQuoteDto): Promise<{
        quote: {
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
        };
        message: {
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
    }>;
    accept(req: Request, id: string): Promise<{
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
    }>;
    decline(req: Request, id: string): Promise<{
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
    }>;
    createOrder(req: Request, dto: CreateOrderRequestDto): Promise<{
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            eventDate: Date;
            clientId: string;
            listingId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            eventId: string | null;
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
    }>;
    acceptOrder(req: Request, bookingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        eventDate: Date;
        clientId: string;
        listingId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventId: string | null;
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
    }>;
    declineOrder(req: Request, bookingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        eventDate: Date;
        clientId: string;
        listingId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventId: string | null;
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
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            conversationId: string;
            dueAt: Date | null;
            createdBy: string;
        };
        message: {
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
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        conversationId: string;
        dueAt: Date | null;
        createdBy: string;
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
