import { KycStatus, Prisma, SubscriptionStatus, SubscriptionTier, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
export declare class AdminService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    dashboard(): Promise<{
        stats: {
            pendingKyc: number;
            openDisputes: number;
            activeUsers: number;
            totalUsers: number;
            totalVendors: number;
            activeSubscriptions: number;
            mrr: number;
            currency: string;
        };
        recentActivity: ({
            user: {
                email: string;
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            ipAddress: string | null;
            metadata: Prisma.JsonValue | null;
            action: string;
            resourceType: string;
            resourceId: string | null;
        })[];
    }>;
    listVendors(params: {
        kycStatus?: KycStatus;
        tier?: SubscriptionTier;
        search?: string;
        take?: number;
        skip?: number;
    }): Promise<{
        data: {
            user: {
                email: string;
                id: string;
                name: string;
                phone: string | null;
                isActive: boolean;
            };
            tags: string[];
            id: string;
            createdAt: Date;
            location: Prisma.JsonValue;
            reviewCount: number;
            ratingAvg: Prisma.Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            businessName: string;
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            kycSubmittedAt: Date | null;
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
    listUsers(params: {
        role?: UserRole;
        isActive?: boolean;
        search?: string;
        take?: number;
        skip?: number;
    }): Promise<{
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
    getUser(id: string): Promise<{
        vendorProfile: {
            id: string;
            reviewCount: number;
            ratingAvg: Prisma.Decimal;
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
    setUserActive(id: string, isActive: boolean, adminId: string, reason?: string, ipAddress?: string): Promise<{
        email: string;
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    listSubscriptions(params: {
        status?: SubscriptionStatus;
        tier?: SubscriptionTier;
        search?: string;
        take?: number;
        skip?: number;
    }): Promise<{
        data: {
            provider: string | null;
            vendor: {
                user: {
                    email: string;
                    id: string;
                    name: string;
                };
                id: string;
                businessName: string;
            };
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            plan: {
                name: string;
                tier: import("@prisma/client").$Enums.SubscriptionTier;
                priceMonthly: Prisma.Decimal;
                priceYearly: Prisma.Decimal;
                currency: string;
            };
            billingCycle: import("@prisma/client").$Enums.BillingCycle;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            trialEndsAt: Date | null;
            cancelAtPeriodEnd: boolean;
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
    revenue(): Promise<{
        currency: string;
        ngnToUsdRate: number;
        activeSubscriptions: number;
        mrr: number;
        arr: number;
        byTier: {
            [k: string]: {
                count: number;
                mrr: number;
            };
        };
    }>;
}
