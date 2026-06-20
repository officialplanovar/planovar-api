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
    }>;
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            eventDate: Date;
        };
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
    })[]>;
    findOne(req: Request, id: string): Promise<{
        booking: {
            id: string;
            eventDate: Date;
            clientId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
        };
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
    }>;
    update(req: Request, id: string, dto: UpdateQuoteDto): Promise<{
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
    }>;
    accept(req: Request, id: string): Promise<{
        booking: {
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
            packageId: string | null;
            eventId: string | null;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
            notes: string | null;
        };
        vendor: {
            user: {
                email: string;
                id: string;
                name: string;
                firstName: string | null;
            };
        } & {
            tags: string[];
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            userId: string;
            description: string | null;
            location: import("@prisma/client/runtime/client").JsonValue;
            reviewCount: number;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            businessName: string;
            logoUrl: string | null;
            coverUrl: string | null;
            portfolioUrls: string[];
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            serviceRadiusKm: number | null;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            ninDocumentUrl: string | null;
            cacDocumentUrl: string | null;
            kycSubmittedAt: Date | null;
            kycReviewedAt: Date | null;
            kycReviewedBy: string | null;
            kycRejectionReason: string | null;
            bankCode: string | null;
            bankAccount: string | null;
            paystackRecipientCode: string | null;
        };
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
    }>;
    reject(req: Request, id: string): Promise<{
        booking: {
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
            packageId: string | null;
            eventId: string | null;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
            notes: string | null;
        };
        vendor: {
            userId: string;
        };
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
    }>;
}
