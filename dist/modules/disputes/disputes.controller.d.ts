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
        description: string;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        resolution: string | null;
        raisedBy: string;
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
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        resolution: string | null;
        raisedBy: string;
        resolvedBy: string | null;
        resolvedAt: Date | null;
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
            eventDate: Date;
            clientId: string;
            listingId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            packageId: string | null;
            eventId: string | null;
            eventLocation: import("@prisma/client/runtime/client").JsonValue;
            requirements: string | null;
            quoteAmount: import("@prisma/client-runtime-utils").Decimal | null;
            finalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            vendorPayout: import("@prisma/client-runtime-utils").Decimal | null;
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
        description: string;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        resolution: string | null;
        raisedBy: string;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    updateStatus(req: Request, id: string, status: DisputeStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        resolution: string | null;
        raisedBy: string;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    resolve(req: Request, id: string, dto: ResolveDisputeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("@prisma/client").$Enums.DisputeStatus;
        reason: string;
        bookingId: string;
        resolution: string | null;
        raisedBy: string;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
}
