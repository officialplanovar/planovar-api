import { BillingCycle, SubscriptionTier } from '@prisma/client';
export type IapPlatform = 'apple' | 'google';
export interface IapProductMapping {
    tier: Extract<SubscriptionTier, 'PREMIUM' | 'GOLD'>;
    cycle: BillingCycle;
}
export declare const IAP_PRODUCTS: Readonly<Record<string, IapProductMapping>>;
export declare function resolveIapProduct(productId: string): IapProductMapping | null;
