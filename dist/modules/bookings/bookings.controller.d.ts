import type { Request } from 'express';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: Request, dto: CreateBookingDto): Promise<{
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
    }>;
    findAll(req: Request, status?: string, take?: string, skip?: string): Promise<({
        client: {
            id: string;
            name: string;
            email: string;
        };
        listing: {
            id: string;
            title: string;
        };
    } & {
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
    })[] | ({
        vendor: {
            id: string;
            slug: string;
            businessName: string;
        };
        listing: {
            id: string;
            title: string;
        };
    } & {
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
    })[]>;
    inboxSummary(req: Request): Promise<{
        actionNeeded: number;
    }>;
    findOne(req: Request, id: string): Promise<{
        client: {
            id: string;
            name: string;
            email: string;
        };
        vendor: {
            id: string;
            slug: string;
            userId: string;
            businessName: string;
        };
        listing: {
            id: string;
            title: string;
        };
        quotes: ({
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
        })[];
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
        statusHistory: {
            id: string;
            createdAt: Date;
            reason: string | null;
            fromStatus: import("@prisma/client").$Enums.BookingStatus | null;
            toStatus: import("@prisma/client").$Enums.BookingStatus;
            changedBy: string;
            bookingId: string;
        }[];
    } & {
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
    }>;
    confirm(req: Request, id: string): Promise<{
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
    }>;
    reject(req: Request, id: string, reason?: string): Promise<{
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
    }>;
    cancel(req: Request, id: string): Promise<{
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
    }>;
    complete(req: Request, id: string): Promise<{
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
    }>;
}
