import type { Request } from 'express';
import { DisputeStatus } from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';
export declare class DisputesController {
    private readonly disputesService;
    constructor(disputesService: DisputesService);
    create(req: Request, dto: CreateDisputeDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        raisedBy: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            eventDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
        };
        raiser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        raisedBy: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    })[]>;
    findOne(req: Request, id: string): Promise<{
        booking: {
            client: {
                id: string;
                name: string;
                email: string;
            };
            vendor: {
                id: string;
                userId: string;
                businessName: string;
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
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
            deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
            pickupAt: Date | null;
            returnAt: Date | null;
            notes: string | null;
            packageId: string | null;
            eventId: string | null;
        };
        raiser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        raisedBy: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    updateStatus(req: Request, id: string, status: DisputeStatus): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        raisedBy: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    resolve(req: Request, id: string, dto: ResolveDisputeDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        raisedBy: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
}
