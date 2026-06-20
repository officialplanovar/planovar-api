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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
                amount: import("@prisma/client-runtime-utils").Decimal;
                quoteId: string;
                label: string;
            }[];
            installments: {
                type: import("@prisma/client").$Enums.InstallmentType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                status: import("@prisma/client").$Enums.InstallmentStatus;
                amount: import("@prisma/client-runtime-utils").Decimal;
                quoteId: string;
                label: string;
                percentage: import("@prisma/client-runtime-utils").Decimal;
                dueAt: Date | null;
                paidAt: Date | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            vendorId: string;
            status: import("@prisma/client").$Enums.QuoteStatus;
            notes: string | null;
            bookingId: string;
            conversationId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            validUntil: Date;
            paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
            escrowPercentage: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        packageId: string | null;
        eventId: string | null;
        eventLocation: import("@prisma/client/runtime/client").JsonValue;
        requirements: string | null;
        quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
        notes: string | null;
    }>;
}
