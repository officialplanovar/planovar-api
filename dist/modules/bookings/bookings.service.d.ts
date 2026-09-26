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
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
    findAll(userId: string, role: UserRole, status?: BookingStatus, take?: number, skip?: number): Promise<({
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    })[]>;
    inboxSummary(userId: string): Promise<{
        actionNeeded: number;
    }>;
    findOne(id: string, userId: string): Promise<{
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
                amount: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
                amount: Prisma.Decimal;
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
            total: Prisma.Decimal;
            notes: string | null;
            eventId: string | null;
            bookingId: string | null;
            conversationId: string;
            quoteId: string | null;
            invoiceNumber: string;
            subtotal: Prisma.Decimal;
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
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
    private transition;
    confirm(id: string, userId: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
    reject(id: string, userId: string, reason?: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
    cancel(id: string, userId: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
    complete(id: string, userId: string): Promise<{
        id: string;
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        eventDate: Date;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
        packageId: string | null;
        eventId: string | null;
    }>;
}
