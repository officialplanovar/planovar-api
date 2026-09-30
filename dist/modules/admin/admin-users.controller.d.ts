import type { Request } from 'express';
import { AdminService } from './admin.service';
import { UserQueryDto } from './dto/admin-query.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
export declare class AdminUsersController {
    private readonly admin;
    constructor(admin: AdminService);
    list(query: UserQueryDto): Promise<{
        data: {
            vendorProfile: {
                id: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                businessName: string;
            } | null;
            email: string;
            id: string;
            createdAt: Date;
            emailVerified: boolean;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
            isActive: boolean;
            _count: {
                events: number;
                bookingsAsClient: number;
            };
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
    getOne(id: string): Promise<{
        vendorProfile: {
            id: string;
            reviewCount: number;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            businessName: string;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        isActive: boolean;
        _count: {
            events: number;
            bookingsAsClient: number;
            reviews: number;
        };
    }>;
    setStatus(req: Request, id: string, dto: SetUserActiveDto): Promise<{
        email: string;
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
}
