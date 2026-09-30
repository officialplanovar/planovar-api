export declare const PAYMENT_PROVIDER: unique symbol;
export type PaidTier = 'PREMIUM' | 'GOLD';
export type BillingCycle = 'monthly' | 'yearly';
export interface CreateSubscriptionInput {
    vendorId: string;
    email: string;
    tier: PaidTier;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
    trialDays?: number;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, unknown>;
}
export interface CreateSubscriptionResult {
    provider: string;
    checkoutUrl?: string;
    providerSubscriptionId?: string;
    providerCustomerId?: string;
    status: 'pending' | 'trialing' | 'active';
    raw?: unknown;
}
export interface CancelSubscriptionInput {
    providerSubscriptionId: string;
    atPeriodEnd?: boolean;
}
export interface WebhookInput {
    rawBody: Buffer | string;
    headers: Record<string, string | undefined>;
}
export type NormalizedWebhookType = 'subscription.activated' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.payment_failed' | 'unknown';
export interface NormalizedWebhookEvent {
    type: NormalizedWebhookType;
    providerSubscriptionId?: string;
    vendorId?: string;
    raw: unknown;
}
export interface VerifyTransactionResult {
    status: 'success' | 'pending' | 'failed';
    raw?: unknown;
}
export interface PaymentProvider {
    readonly name: string;
    createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>;
    cancelSubscription(input: CancelSubscriptionInput): Promise<void>;
    verifyAndParseWebhook(input: WebhookInput): Promise<NormalizedWebhookEvent>;
    verifyTransaction?(reference: string): Promise<VerifyTransactionResult>;
}
