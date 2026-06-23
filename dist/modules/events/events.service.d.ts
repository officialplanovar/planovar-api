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
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: Prisma.JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
    }>;
    findAll(userId: string): Promise<{
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        coverUrl: string | null;
        location: Prisma.JsonValue;
        eventDate: Date;
        guestCount: number | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        bookings: {
            status: import("@prisma/client").$Enums.BookingStatus;
            id: string;
            eventDate: Date;
            quoteAmount: Prisma.Decimal | null;
        }[];
        eventVendors: ({
            vendor: {
                id: string;
                slug: string;
                businessName: string;
            };
        } & {
            id: string;
            vendorId: string;
            bookingId: string | null;
            eventId: string;
            addedAt: Date;
        })[];
    } & {
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: Prisma.JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
    }>;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: Prisma.JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
    }>;
    cancel(id: string, userId: string): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: Prisma.JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
    }>;
    addVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        bookingId: string | null;
        eventId: string;
        addedAt: Date;
    }>;
    removeVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        bookingId: string | null;
        eventId: string;
        addedAt: Date;
    }>;
}
