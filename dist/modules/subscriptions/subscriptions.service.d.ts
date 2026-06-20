import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { NormalizedWebhookEvent, PaymentProvider } from '../billing/payment-provider.interface';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class SubscriptionsService {
    private readonly prisma;
    private readonly billing;
    constructor(prisma: PrismaService, billing: PaymentProvider);
    private get billingCurrency();
    private priceInBillingCurrency;
    private withBillingCurrency;
    listPlans(): Promise<any[]>;
    getMySubscription(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: Prisma.Decimal;
            priceYearly: Prisma.Decimal;
            currency: string;
            listingLimit: number | null;
            features: Prisma.JsonValue;
        };
        provider: string | null;
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    }>;
    subscribe(userId: string, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: Prisma.Decimal;
            priceYearly: Prisma.Decimal;
            currency: string;
            listingLimit: number | null;
            features: Prisma.JsonValue;
        };
        provider: string | null;
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
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
    verifyPayment(userId: string, reference: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: Prisma.Decimal;
            priceYearly: Prisma.Decimal;
            currency: string;
            listingLimit: number | null;
            features: Prisma.JsonValue;
        };
        provider: string | null;
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import("@prisma/client").$Enums.BillingCycle;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
    } | {
        status: string;
    }>;
    changePlan(userId: string, dto: SubscribeDto, deviceId?: string): Promise<{
        plan: {
            id: string;
            name: string;
            tier: import("@prisma/client").$Enums.SubscriptionTier;
            priceMonthly: Prisma.Decimal;
            priceYearly: Prisma.Decimal;
            currency: string;
            listingLimit: number | null;
            features: Prisma.JsonValue;
        };
        provider: string | null;
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
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
    cancelSubscription(userId: string): Promise<{
        message: string;
    }>;
    handleSubscriptionWebhook(event: {
        event: string;
        data: any;
    }): Promise<void>;
    private handleSubscriptionCreate;
    private handleInvoicePaymentFailed;
    private handleSubscriptionDisable;
    handleProviderWebhook(rawBody: Buffer | string, headers: Record<string, string | undefined>): Promise<{
        received: boolean;
    }>;
    applyWebhookEvent(event: NormalizedWebhookEvent): Promise<void>;
    private requireVendor;
}
