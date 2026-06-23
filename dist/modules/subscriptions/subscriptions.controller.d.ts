import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    listPlans(): Promise<any[]>;
    getMySubscription(req: Request): Promise<{
        plan: {
            id: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            name: string;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
        };
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        provider: string | null;
        id: string;
        createdAt: Date;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    }>;
    subscribe(req: Request, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            name: string;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
        };
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        provider: string | null;
        id: string;
        createdAt: Date;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    } | {
        status: string;
        tier: "BASIC";
        checkoutUrl?: undefined;
        reference?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        checkoutUrl: string | undefined;
        reference: string | undefined;
    }>;
    changePlan(req: Request, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            name: string;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
        };
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        provider: string | null;
        id: string;
        createdAt: Date;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    } | {
        status: string;
        tier: "BASIC";
        checkoutUrl?: undefined;
        reference?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        checkoutUrl: string | undefined;
        reference: string | undefined;
    }>;
    verifyPayment(req: Request, dto: VerifyPaymentDto): Promise<{
        plan: {
            id: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            name: string;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
        };
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        provider: string | null;
        id: string;
        createdAt: Date;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    } | {
        status: string;
    }>;
    cancelSubscription(req: Request): Promise<{
        message: string;
    }>;
    billingWebhook(req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
