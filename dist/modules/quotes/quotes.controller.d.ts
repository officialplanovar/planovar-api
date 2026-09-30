import type { Request } from 'express';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(req: Request, dto: CreateQuoteDto): Promise<{
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
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            eventDate: Date;
        } | null;
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
    })[]>;
    findOne(req: Request, id: string): Promise<{
        booking: {
            id: string;
            eventDate: Date;
            clientId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
        } | null;
        vendor: {
            id: string;
            userId: string;
            slug: string;
            businessName: string;
        };
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
    }>;
    update(req: Request, id: string, dto: UpdateQuoteDto): Promise<{
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
    accept(req: Request, id: string): Promise<{
        booking: ({
            listing: {
                title: string;
            };
            client: {
                email: string;
                id: string;
                name: string;
                firstName: string | null;
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
        }) | null;
        vendor: {
            user: {
                email: string;
                id: string;
                name: string;
                firstName: string | null;
            };
        } & {
            description: string | null;
            tags: string[];
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            userId: string;
            location: import("@prisma/client/runtime/client").JsonValue;
            reviewCount: number;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            coverUrl: string | null;
            businessName: string;
            logoUrl: string | null;
            portfolioUrls: string[];
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            serviceRadiusKm: number | null;
            eventTypes: import("@prisma/client").$Enums.EventType[];
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            idDocumentUrl: string | null;
            idType: string | null;
            idCountry: string | null;
            businessRegDocumentUrl: string | null;
            businessRegCountry: string | null;
            kycSubmittedAt: Date | null;
            kycReviewedAt: Date | null;
            kycReviewedBy: string | null;
            kycRejectionReason: string | null;
        };
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
    }>;
    reject(req: Request, id: string): Promise<{
        booking: ({
            listing: {
                title: string;
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
        }) | null;
        vendor: {
            userId: string;
        };
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
    }>;
}
