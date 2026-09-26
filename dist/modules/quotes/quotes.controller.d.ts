import type { Request } from 'express';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(req: Request, dto: CreateQuoteDto): Promise<{
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
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            eventDate: Date;
        } | null;
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
    })[]>;
    findOne(req: Request, id: string): Promise<{
        vendor: {
            id: string;
            userId: string;
            businessName: string;
            slug: string;
        };
        booking: {
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            clientId: string;
            eventDate: Date;
        } | null;
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
    }>;
    update(req: Request, id: string, dto: UpdateQuoteDto): Promise<{
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
    accept(req: Request, id: string): Promise<{
        vendor: {
            user: {
                email: string;
                id: string;
                name: string;
                firstName: string | null;
            };
        } & {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            userId: string;
            tags: string[];
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            businessName: string;
            slug: string;
            description: string | null;
            logoUrl: string | null;
            coverUrl: string | null;
            portfolioUrls: string[];
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            location: import("@prisma/client/runtime/client").JsonValue;
            serviceRadiusKm: number | null;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            reviewCount: number;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            ninDocumentUrl: string | null;
            cacDocumentUrl: string | null;
            kycSubmittedAt: Date | null;
            kycReviewedAt: Date | null;
            kycReviewedBy: string | null;
            kycRejectionReason: string | null;
            isVerified: boolean;
        };
        booking: ({
            client: {
                email: string;
                id: string;
                name: string;
                firstName: string | null;
            };
            listing: {
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
        }) | null;
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
        }) | null;
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
    }>;
}
