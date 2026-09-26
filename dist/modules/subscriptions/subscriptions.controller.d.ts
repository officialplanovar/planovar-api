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
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
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
        cancelledAt: Date | null;
    }>;
    subscribe(req: Request, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
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
        cancelledAt: Date | null;
    } | {
        status: string;
        tier: "BASIC";
        trialEndsAt?: undefined;
        prorationCredit?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        trialEndsAt: Date;
        prorationCredit?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        prorationCredit: number;
        trialEndsAt?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        checkoutUrl: string | undefined;
        reference: string | undefined;
        prorationCredit: number;
        amountCharged: number;
        trialEndsAt?: undefined;
    }>;
    changePlan(req: Request, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
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
        cancelledAt: Date | null;
    } | {
        status: string;
        tier: "BASIC";
        trialEndsAt?: undefined;
        prorationCredit?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        trialEndsAt: Date;
        prorationCredit?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        prorationCredit: number;
        trialEndsAt?: undefined;
        checkoutUrl?: undefined;
        reference?: undefined;
        amountCharged?: undefined;
    } | {
        status: string;
        tier: "PREMIUM" | "GOLD";
        checkoutUrl: string | undefined;
        reference: string | undefined;
        prorationCredit: number;
        amountCharged: number;
        trialEndsAt?: undefined;
    }>;
    verifyPayment(req: Request, dto: VerifyPaymentDto): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: import("@prisma/client-runtime-utils").Decimal;
            priceYearly: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            listingLimit: number | null;
            features: import("@prisma/client/runtime/client").JsonValue;
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
