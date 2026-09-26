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
                id: string;
                name: string;
                email: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            metadata: Prisma.JsonValue | null;
            userId: string | null;
            action: string;
            resourceType: string;
            resourceId: string | null;
            ipAddress: string | null;
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
            id: string;
            tags: string[];
            location: Prisma.JsonValue;
            reviewCount: number;
            createdAt: Date;
            ratingAvg: Prisma.Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            businessName: string;
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            idDocumentUrl: string | null;
            idType: string | null;
            idCountry: string | null;
            businessRegDocumentUrl: string | null;
            businessRegCountry: string | null;
            kycSubmittedAt: Date | null;
            user: {
                id: string;
                isActive: boolean;
                name: string;
                phone: string | null;
                email: string;
            };
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
    getUser(id: string): Promise<{
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
            ratingAvg: Prisma.Decimal;
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
    setUserActive(id: string, isActive: boolean, adminId: string, reason?: string, ipAddress?: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    listSubscriptions(params: {
        status?: SubscriptionStatus;
        tier?: SubscriptionTier;
        search?: string;
        take?: number;
        skip?: number;
    }): Promise<{
        data: {
            vendor: {
                id: string;
                businessName: string;
                user: {
                    id: string;
                    name: string;
                    email: string;
                };
            };
            id: string;
            createdAt: Date;
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
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    promoteToAdmin(email: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    setUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
}
