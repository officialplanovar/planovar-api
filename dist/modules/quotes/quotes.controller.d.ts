import type { Request } from 'express';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(req: Request, dto: CreateQuoteDto): Promise<{
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
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            eventDate: Date;
        } | null;
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
    })[]>;
    findOne(req: Request, id: string): Promise<{
        vendor: {
            id: string;
            slug: string;
            userId: string;
            businessName: string;
        };
        booking: {
            id: string;
            eventDate: Date;
            clientId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
        } | null;
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
    }>;
    update(req: Request, id: string, dto: UpdateQuoteDto): Promise<{
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
    accept(req: Request, id: string): Promise<{
        vendor: {
            user: {
                id: string;
                name: string;
                email: string;
                firstName: string | null;
            };
        } & {
            id: string;
            description: string | null;
            tags: string[];
            location: import("@prisma/client/runtime/client").JsonValue;
            reviewCount: number;
            createdAt: Date;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            coverUrl: string | null;
            updatedAt: Date;
            userId: string;
            businessName: string;
            logoUrl: string | null;
            portfolioUrls: string[];
            phone: string | null;
            email: string | null;
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
        booking: ({
            client: {
                id: string;
                name: string;
                email: string;
                firstName: string | null;
            };
            listing: {
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
        }) | null;
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
    }>;
    reject(req: Request, id: string): Promise<{
        vendor: {
            userId: string;
        };
        booking: ({
            listing: {
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
        }) | null;
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
    }>;
}
