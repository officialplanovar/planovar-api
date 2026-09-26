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
            metadata: Prisma.JsonValue | null;
            id: string;
            createdAt: Date;
            userId: string | null;
            ipAddress: string | null;
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
            id: string;
            createdAt: Date;
            tags: string[];
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            businessName: string;
            slug: string;
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            location: Prisma.JsonValue;
            ratingAvg: Prisma.Decimal;
            reviewCount: number;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            ninDocumentUrl: string | null;
            cacDocumentUrl: string | null;
            kycSubmittedAt: Date | null;
            isVerified: boolean;
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
    getUser(id: string): Promise<{
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
            ratingAvg: Prisma.Decimal;
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
            id: string;
            createdAt: Date;
            vendor: {
                user: {
                    email: string;
                    id: string;
                    name: string;
                };
                id: string;
                businessName: string;
            };
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            billingCycle: import("@prisma/client").$Enums.BillingCycle;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            trialEndsAt: Date | null;
            cancelAtPeriodEnd: boolean;
            provider: string | null;
            plan: {
                name: string;
                tier: import("@prisma/client").$Enums.SubscriptionTier;
                priceMonthly: Prisma.Decimal;
                priceYearly: Prisma.Decimal;
                currency: string;
            };
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
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        currency: string;
        platformName: string;
        supportEmail: string;
        region: string;
        maintenanceMode: boolean;
    }>;
    updateSettings(dto: {
        platformName?: string;
        supportEmail?: string;
        currency?: string;
        region?: string;
        maintenanceMode?: boolean;
    }): Promise<{
        id: string;
        updatedAt: Date;
        currency: string;
        platformName: string;
        supportEmail: string;
        region: string;
        maintenanceMode: boolean;
    }>;
    private static readonly PLAN_SELECT;
    getPlans(): Promise<{
        name: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        priceMonthly: Prisma.Decimal;
        priceYearly: Prisma.Decimal;
        currency: string;
        listingLimit: number | null;
        features: Prisma.JsonValue;
    }[]>;
    updatePlan(tier: string, dto: {
        name?: string;
        priceMonthly?: number;
        priceYearly?: number;
        currency?: string;
        listingLimit?: number | null;
        features?: string[];
    }): Promise<{
        name: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        priceMonthly: Prisma.Decimal;
        priceYearly: Prisma.Decimal;
        currency: string;
        listingLimit: number | null;
        features: Prisma.JsonValue;
    }>;
    listAdmins(): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    promoteToAdmin(email: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    setUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
}
