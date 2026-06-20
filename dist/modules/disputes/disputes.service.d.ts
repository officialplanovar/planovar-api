import { DisputeStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
export declare class DisputesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(raisedBy: string, dto: CreateDisputeDto): Promise<{
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
    findAll(userId: string, role: UserRole): Promise<({
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
    findOne(id: string, userId: string, role: UserRole): Promise<{
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
    updateStatus(id: string, status: DisputeStatus, adminId: string): Promise<{
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
    resolve(id: string, dto: ResolveDisputeDto, adminId: string): Promise<{
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
