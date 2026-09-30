import { BillingCycle, SubscriptionTier } from '@prisma/client';

/**
 * Store product identifier → Planovar (tier, cycle) mapping.
 *
 * These IDs must match the auto-renewable subscription products configured in
 * App Store Connect and the Google Play Console. They are the SINGLE source of
 * truth the IAP verify path uses to translate a store purchase into a Planovar
 * plan — the store never sends our internal plan UUIDs.
 *
 * BASIC (free) is intentionally absent: the free tier is never sold through a
 * store product.
 */
export type IapPlatform = 'apple' | 'google';

export interface IapProductMapping {
  tier: Extract<SubscriptionTier, 'PREMIUM' | 'GOLD'>;
  cycle: BillingCycle;
}

export const IAP_PRODUCTS: Readonly<Record<string, IapProductMapping>> = {
  premium_monthly: { tier: SubscriptionTier.PREMIUM, cycle: BillingCycle.MONTHLY },
  premium_yearly: { tier: SubscriptionTier.PREMIUM, cycle: BillingCycle.YEARLY },
  gold_monthly: { tier: SubscriptionTier.GOLD, cycle: BillingCycle.MONTHLY },
  gold_yearly: { tier: SubscriptionTier.GOLD, cycle: BillingCycle.YEARLY },
} as const;

/** Resolve a store product id to its (tier, cycle), or null if unknown. */
export function resolveIapProduct(productId: string): IapProductMapping | null {
  return IAP_PRODUCTS[productId] ?? null;
}
