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
    }>;
    findAll(req: Request, status?: string, take?: string, skip?: string): Promise<({
        client: {
            email: string;
            id: string;
            name: string;
        };
        listing: {
            id: string;
            title: string;
        };
    } & {
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
    })[] | ({
        vendor: {
            id: string;
            businessName: string;
            slug: string;
        };
        listing: {
            id: string;
            title: string;
        };
    } & {
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
    })[]>;
    inboxSummary(req: Request): Promise<{
        actionNeeded: number;
    }>;
    findOne(req: Request, id: string): Promise<{
        client: {
            email: string;
            id: string;
            name: string;
        };
        vendor: {
            id: string;
            userId: string;
            businessName: string;
            slug: string;
        };
        quotes: ({
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
        })[];
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
        listing: {
            id: string;
            title: string;
        };
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
    }>;
    confirm(req: Request, id: string): Promise<{
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
    }>;
    reject(req: Request, id: string, reason?: string): Promise<{
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
    }>;
    cancel(req: Request, id: string): Promise<{
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
    }>;
    complete(req: Request, id: string): Promise<{
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
    }>;
}
