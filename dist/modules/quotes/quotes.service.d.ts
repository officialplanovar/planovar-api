import { Prisma, UserRole } from '@prisma/client';
import { EmailService } from '../../common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
export declare class QuotesService {
    private readonly prisma;
    private readonly email;
    private readonly notifications;
    constructor(prisma: PrismaService, email: EmailService, notifications: NotificationsService);
    private getVendorProfile;
    private assertVendorOwns;
    private assertClientOwns;
    create(userId: string, dto: CreateQuoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        vendorId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        bookingId: string;
        conversationId: string | null;
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    findAll(userId: string, role: UserRole): Promise<({
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
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    })[]>;
    findOne(id: string, userId: string): Promise<{
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
            amount: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            quoteId: string;
            label: string;
            percentage: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    update(id: string, userId: string, dto: UpdateQuoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        vendorId: string;
        status: import("@prisma/client").$Enums.QuoteStatus;
        notes: string | null;
        bookingId: string;
        conversationId: string | null;
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    accept(id: string, userId: string): Promise<{
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
            eventLocation: Prisma.JsonValue;
            requirements: string | null;
            quoteAmount: Prisma.Decimal | null;
            finalAmount: Prisma.Decimal | null;
            platformFee: Prisma.Decimal | null;
            vendorPayout: Prisma.Decimal | null;
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
            location: Prisma.JsonValue;
            reviewCount: number;
            ratingAvg: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
    reject(id: string, userId: string): Promise<{
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
            eventLocation: Prisma.JsonValue;
            requirements: string | null;
            quoteAmount: Prisma.Decimal | null;
            finalAmount: Prisma.Decimal | null;
            platformFee: Prisma.Decimal | null;
            vendorPayout: Prisma.Decimal | null;
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
        amount: Prisma.Decimal;
        validUntil: Date;
        paymentStructure: import("@prisma/client").$Enums.QuotePaymentStructure;
        escrowPercentage: Prisma.Decimal | null;
        isLocked: boolean;
        lockedAt: Date | null;
    }>;
}
