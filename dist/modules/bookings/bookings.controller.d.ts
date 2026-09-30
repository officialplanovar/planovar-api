import type { Request } from 'express';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: Request, dto: CreateBookingDto): Promise<{
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
    }>;
    findAll(req: Request, status?: string, take?: string, skip?: string): Promise<({
        listing: {
            id: string;
            title: string;
        };
        client: {
            email: string;
            id: string;
            name: string;
        };
    } & {
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
    })[] | ({
        listing: {
            id: string;
            title: string;
        };
        vendor: {
            id: string;
            slug: string;
            businessName: string;
        };
    } & {
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
    })[]>;
    inboxSummary(req: Request): Promise<{
        actionNeeded: number;
    }>;
    findOne(req: Request, id: string): Promise<{
        listing: {
            id: string;
            title: string;
        };
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
        client: {
            email: string;
            id: string;
            name: string;
        };
        vendor: {
            id: string;
            userId: string;
            slug: string;
            businessName: string;
        };
        quotes: ({
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
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            bookingId: string;
            fromStatus: import("@prisma/client").$Enums.BookingStatus | null;
            toStatus: import("@prisma/client").$Enums.BookingStatus;
            changedBy: string;
        }[];
    } & {
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
    }>;
    confirm(req: Request, id: string): Promise<{
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
    }>;
    reject(req: Request, id: string, reason?: string): Promise<{
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
    }>;
    cancel(req: Request, id: string): Promise<{
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
    }>;
    complete(req: Request, id: string): Promise<{
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
    }>;
}
