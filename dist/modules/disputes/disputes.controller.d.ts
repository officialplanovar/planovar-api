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
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        description: string;
        reason: string;
        bookingId: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        raisedBy: string;
    }>;
    findAll(req: Request): Promise<({
        booking: {
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            eventDate: Date;
        };
        raiser: {
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        description: string;
        reason: string;
        bookingId: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        raisedBy: string;
    })[]>;
    findOne(req: Request, id: string): Promise<{
        booking: {
            client: {
                email: string;
                id: string;
                name: string;
            };
            vendor: {
                id: string;
                userId: string;
                businessName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            clientId: string;
            eventId: string | null;
            listingId: string;
            eventDate: Date;
            packageId: string | null;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            fulfilmentType: import("@prisma/client").$Enums.FulfilmentType | null;
            deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod | null;
            pickupAt: Date | null;
            returnAt: Date | null;
            notes: string | null;
        };
        raiser: {
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        description: string;
        reason: string;
        bookingId: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        raisedBy: string;
    }>;
    updateStatus(req: Request, id: string, status: DisputeStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        description: string;
        reason: string;
        bookingId: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        raisedBy: string;
    }>;
    resolve(req: Request, id: string, dto: ResolveDisputeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DisputeStatus;
        description: string;
        reason: string;
        bookingId: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        raisedBy: string;
    }>;
}
