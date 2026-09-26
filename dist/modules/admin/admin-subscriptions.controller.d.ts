import { AdminService } from './admin.service';
import { SubscriptionQueryDto } from './dto/admin-query.dto';
export declare class AdminSubscriptionsController {
    private readonly admin;
    constructor(admin: AdminService);
    list(query: SubscriptionQueryDto): Promise<{
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
