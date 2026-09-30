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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        invoice: ({
            lineItems: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                invoiceId: string;
                label: string;
                amount: Prisma.Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            clientId: string;
            listingId: string | null;
            total: Prisma.Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            eventId: string | null;
            notes: string | null;
            bookingId: string | null;
            invoiceNumber: string;
            quoteId: string | null;
            conversationId: string;
            subtotal: Prisma.Decimal;
            issuedAt: Date;
        }) | null;
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
                quoteId: string;
                label: string;
                amount: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            quoteNumber: string | null;
            paymentTerms: string | null;
            validUntil: Date;
            parentQuoteId: string | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
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
        eventId: string | null;
        packageId: string | null;
        eventLocation: Prisma.JsonValue;
        requirements: string | null;
        quoteAmount: Prisma.Decimal | null;
        finalAmount: Prisma.Decimal | null;
        fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
        pickupAt: Date | null;
        returnAt: Date | null;
        notes: string | null;
    }>;
}
