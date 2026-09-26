import { AdminService } from './admin.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class AdminPlansController {
    private readonly admin;
    constructor(admin: AdminService);
    list(): Promise<{
        name: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        priceMonthly: import("@prisma/client-runtime-utils").Decimal;
        priceYearly: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        listingLimit: number | null;
        features: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    update(tier: string, body: UpdatePlanDto): Promise<{
        name: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        priceMonthly: import("@prisma/client-runtime-utils").Decimal;
        priceYearly: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        listingLimit: number | null;
        features: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
