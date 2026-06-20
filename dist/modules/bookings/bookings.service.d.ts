import { BookingStatus, Prisma, UserRole } from '@prisma/client';
import { EmailService } from '../../common/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private readonly prisma;
    private readonly email;
    private readonly notifications;
    constructor(prisma: PrismaService, email: EmailService, notifications: NotificationsService);
    private getVendorProfile;
    private extractLocation;
    create(userId: string, dto: CreateBookingDto): Promise<{
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
    }>;
    findAll(userId: string, role: UserRole, status?: BookingStatus, take?: number, skip?: number): Promise<({
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        platformFee: Prisma.Decimal | null;
        vendorPayout: Prisma.Decimal | null;
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        platformFee: Prisma.Decimal | null;
        vendorPayout: Prisma.Decimal | null;
        notes: string | null;
    })[]>;
    inboxSummary(userId: string): Promise<{
        actionNeeded: number;
    }>;
    findOne(id: string, userId: string): Promise<{
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        platformFee: Prisma.Decimal | null;
        vendorPayout: Prisma.Decimal | null;
        notes: string | null;
    }>;
    private transition;
    confirm(id: string, userId: string): Promise<{
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
    }>;
    reject(id: string, userId: string, reason?: string): Promise<{
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
    }>;
    cancel(id: string, userId: string): Promise<{
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
    }>;
    complete(id: string, userId: string): Promise<{
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
    }>;
}
