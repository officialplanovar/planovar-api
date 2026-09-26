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
        status: import("@prisma/client").$Enums.EventStatus;
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
        id: string;
        createdAt: Date;
        name: string;
        _count: {
            eventVendors: number;
        };
        status: import("@prisma/client").$Enums.EventStatus;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue;
        eventListings: {
            listingId: string;
        }[];
        eventDate: Date;
        guestCount: number | null;
        budgetMin: import("@prisma/client-runtime-utils").Decimal | null;
        budgetMax: import("@prisma/client-runtime-utils").Decimal | null;
    }[]>;
    findOne(req: Request, id: string): Promise<{
        bookings: {
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            eventDate: Date;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        eventVendors: ({
            vendor: {
                id: string;
                businessName: string;
                slug: string;
                logoUrl: string | null;
                coverUrl: string | null;
            };
        } & {
            id: string;
            vendorId: string;
            bookingId: string | null;
            eventId: string;
            addedAt: Date;
        })[];
        eventListings: ({
            listing: {
                id: string;
                vendorId: string;
                ratingAvg: import("@prisma/client-runtime-utils").Decimal;
                reviewCount: number;
                title: string;
                pricingType: import("@prisma/client").$Enums.PricingType;
                basePrice: import("@prisma/client-runtime-utils").Decimal | null;
                isRentable: boolean;
                media: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            eventId: string;
            listingId: string;
            addedAt: Date;
        })[];
        groupConversation: {
            id: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.EventStatus;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.EventStatus;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.EventStatus;
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
    addListing(req: Request, id: string, listingId: string): Promise<{
        added: boolean;
    }>;
    removeListing(req: Request, id: string, listingId: string): Promise<{
        removed: boolean;
    }>;
}
