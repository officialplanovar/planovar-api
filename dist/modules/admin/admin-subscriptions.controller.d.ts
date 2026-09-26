import { AdminService } from './admin.service';
import { SubscriptionQueryDto } from './dto/admin-query.dto';
export declare class AdminSubscriptionsController {
    private readonly admin;
    constructor(admin: AdminService);
    list(query: SubscriptionQueryDto): Promise<{
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
                priceMonthly: import("@prisma/client-runtime-utils").Decimal;
                priceYearly: import("@prisma/client-runtime-utils").Decimal;
                currency: string;
            };
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
}
