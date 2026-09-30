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
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: Prisma.JsonValue | null;
        coverUrl: string | null;
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
        createdAt: Date;
        name: string;
        _count: {
            eventVendors: number;
        };
        location: Prisma.JsonValue;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        eventListings: {
            listingId: string;
        }[];
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
            addedAt: Date;
            bookingId: string | null;
        })[];
        groupConversation: {
            id: string;
        } | null;
    } & {
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: Prisma.JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: Prisma.JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    cancel(id: string, userId: string): Promise<{
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: Prisma.JsonValue | null;
        coverUrl: string | null;
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
        addedAt: Date;
        bookingId: string | null;
    }>;
    private syncVendorIntoEventGroup;
    removeVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        addedAt: Date;
        bookingId: string | null;
    }>;
    addListing(eventId: string, userId: string, listingId: string): Promise<{
        added: boolean;
    }>;
    removeListing(eventId: string, userId: string, listingId: string): Promise<{
        removed: boolean;
    }>;
}
