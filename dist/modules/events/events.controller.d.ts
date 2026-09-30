import type { Request } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(req: Request, dto: CreateEventDto): Promise<{
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        _count: {
            eventVendors: number;
        };
        location: import("@prisma/client/runtime/client").JsonValue;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        eventListings: {
            listingId: string;
        }[];
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
        eventListings: ({
            listing: {
                id: string;
                title: string;
                pricingType: import("@prisma/client").$Enums.PricingType;
                vendorId: string;
                reviewCount: number;
                isRentable: boolean;
                ratingAvg: import("@prisma/client-runtime-utils").Decimal;
                basePrice: import("@prisma/client-runtime-utils").Decimal | null;
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
        location: import("@prisma/client/runtime/client").JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    update(req: Request, id: string, dto: UpdateEventDto): Promise<{
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    cancel(req: Request, id: string): Promise<{
        description: string | null;
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        location: import("@prisma/client/runtime/client").JsonValue | null;
        coverUrl: string | null;
        eventDate: Date;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
        clientId: string;
        status: import("@prisma/client").$Enums.EventStatus;
        guestCount: number | null;
        durationHours: number | null;
    }>;
    addVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        addedAt: Date;
        bookingId: string | null;
    }>;
    removeVendor(req: Request, id: string, vendorId: string): Promise<{
        id: string;
        vendorId: string;
        eventId: string;
        addedAt: Date;
        bookingId: string | null;
    }>;
    addListing(req: Request, id: string, listingId: string): Promise<{
        added: boolean;
    }>;
    removeListing(req: Request, id: string, listingId: string): Promise<{
        removed: boolean;
    }>;
}
