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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        location: Prisma.JsonValue;
        eventDate: Date;
        coverUrl: string | null;
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
        eventVendors: ({
            vendor: {
                id: string;
                slug: string;
                businessName: string;
            };
        } & {
            id: string;
            vendorId: string;
            eventId: string;
            bookingId: string | null;
            addedAt: Date;
        })[];
    } & {
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    cancel(id: string, userId: string): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: Prisma.JsonValue | null;
        eventDate: Date;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        clientId: string;
        coverUrl: string | null;
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
    removeVendor(eventId: string, userId: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        bookingId: string | null;
        addedAt: Date;
    }>;
}
