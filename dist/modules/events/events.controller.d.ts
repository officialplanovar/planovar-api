import type { Request } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(req: Request, dto: CreateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        eventDate: Date;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
    }[]>;
    findOne(req: Request, id: string): Promise<{
        bookings: {
            id: string;
            eventDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
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
        location: import("@prisma/client/runtime/client").JsonValue | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    update(req: Request, id: string, dto: UpdateEventDto): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    cancel(req: Request, id: string): Promise<{
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        coverUrl: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    addVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        bookingId: string | null;
        addedAt: Date;
    }>;
    removeVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        bookingId: string | null;
        addedAt: Date;
    }>;
}
