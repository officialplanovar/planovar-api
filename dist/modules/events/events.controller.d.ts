import type { Request } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(req: Request, dto: CreateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    findAll(req: Request): Promise<{
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue;
        eventDate: Date;
        guestCount: number | null;
    }[]>;
    findOne(req: Request, id: string): Promise<{
        bookings: {
            status: import("@prisma/client").$Enums.BookingStatus;
            id: string;
            eventDate: Date;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
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
        location: import("@prisma/client/runtime/client").JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(req: Request, id: string, dto: UpdateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    cancel(req: Request, id: string): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        status: import("@prisma/client").$Enums.EventStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        clientId: string;
        eventDate: Date;
        guestCount: number | null;
        durationHours: number | null;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    addVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        bookingId: string | null;
        eventId: string;
        addedAt: Date;
    }>;
    removeVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        bookingId: string | null;
        eventId: string;
        addedAt: Date;
    }>;
}
