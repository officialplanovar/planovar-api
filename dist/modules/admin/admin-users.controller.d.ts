import type { Request } from 'express';
import { AdminService } from './admin.service';
import { UserQueryDto } from './dto/admin-query.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
export declare class AdminUsersController {
    private readonly admin;
    constructor(admin: AdminService);
    list(query: UserQueryDto): Promise<{
        data: {
            email: string;
            id: string;
            createdAt: Date;
            emailVerified: boolean;
            name: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
            isActive: boolean;
            vendorProfile: {
                id: string;
                businessName: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            } | null;
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
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        isActive: boolean;
        vendorProfile: {
            id: string;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            businessName: string;
            slug: string;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            reviewCount: number;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
        } | null;
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
