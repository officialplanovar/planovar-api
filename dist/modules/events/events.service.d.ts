import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    private getEventForOwner;
    create(userId: string, dto: CreateEventDto): Promise<{
        id: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EventType;
        coverUrl: string | null;
        updatedAt: Date;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        location: Prisma.JsonValue;
        createdAt: Date;
        name: string;
        coverUrl: string | null;
        eventListings: {
            listingId: string;
        }[];
        _count: {
            eventVendors: number;
        };
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        bookings: {
            id: string;
            eventDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            quoteAmount: Prisma.Decimal | null;
        }[];
        eventListings: ({
            listing: {
                id: string;
                title: string;
                pricingType: import("@prisma/client").$Enums.PricingType;
                vendorId: string;
                reviewCount: number;
                isRentable: boolean;
                ratingAvg: Prisma.Decimal;
                basePrice: Prisma.Decimal | null;
                media: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            listingId: string;
            eventId: string;
            addedAt: Date;
        })[];
        eventVendors: ({
            vendor: {
                id: string;
                slug: string;
                coverUrl: string | null;
                businessName: string;
                logoUrl: string | null;
            };
        } & {
            id: string;
            vendorId: string;
            eventId: string;
            bookingId: string | null;
            addedAt: Date;
        })[];
        groupConversation: {
            id: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EventType;
        coverUrl: string | null;
        updatedAt: Date;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        id: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EventType;
        coverUrl: string | null;
        updatedAt: Date;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    cancel(id: string, userId: string): Promise<{
        id: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EventType;
        coverUrl: string | null;
        updatedAt: Date;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    addVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        bookingId: string | null;
        addedAt: Date;
    }>;
    private syncVendorIntoEventGroup;
    removeVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        bookingId: string | null;
        addedAt: Date;
    }>;
    addListing(eventId: string, userId: string, listingId: string): Promise<{
        added: boolean;
    }>;
    removeListing(eventId: string, userId: string, listingId: string): Promise<{
        removed: boolean;
    }>;
}
