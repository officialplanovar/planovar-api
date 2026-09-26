import type { Request } from 'express';
import { AdminService } from './admin.service';
import { UserQueryDto } from './dto/admin-query.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
export declare class AdminUsersController {
    private readonly admin;
    constructor(admin: AdminService);
    list(query: UserQueryDto): Promise<{
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            _count: {
                events: number;
                bookingsAsClient: number;
            };
            vendorProfile: {
                id: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                businessName: string;
            } | null;
            phone: string | null;
            email: string;
            emailVerified: boolean;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
    getOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        _count: {
            reviews: number;
            events: number;
            bookingsAsClient: number;
        };
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
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    setStatus(req: Request, id: string, dto: SetUserActiveDto): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
