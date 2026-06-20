/**
 * Provider-agnostic billing contract for VENDOR SUBSCRIPTIONS.
 *
 * Decision (2026-06-09): subscriptions are the only money flow on the platform,
 * billed in USD. We implement one flow against this interface and switch the
 * concrete provider via the `PAYMENT_PROVIDER` env var
 * (`stripe` | `paystack` | `paypal` | `iap`) without touching business logic.
 *
 * Adapters live in ./adapters and are selected by the factory in billing.module.ts.
 */

/** DI token to inject the active provider: `@Inject(PAYMENT_PROVIDER)`. */
export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export type PaidTier = 'PREMIUM' | 'GOLD';
export type BillingCycle = 'monthly' | 'yearly';

export interface CreateSubscriptionInput {
  vendorId: string;
  email: string;
  tier: PaidTier;
  billingCycle: BillingCycle;
  /** Amount in minor units (e.g. cents) of `currency`. */
  amount: number;
  /** ISO currency code, e.g. 'USD'. */
  currency: string;
  /** Free-trial length in days (e.g. 45). Omit/0 for none. */
  trialDays?: number;
  /** Redirect target after a successful hosted checkout (required by Stripe). */
  successUrl?: string;
  /** Redirect target if the vendor abandons checkout. */
  cancelUrl?: string;
  /** Echoed back on webhooks for reconciliation. */
  metadata?: Record<string, unknown>;
}

export interface CreateSubscriptionResult {
  provider: string;
  /** Hosted-checkout / approval URL to redirect the vendor to, when applicable. */
  checkoutUrl?: string;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  status: 'pending' | 'trialing' | 'active';
  raw?: unknown;
}

export interface CancelSubscriptionInput {
  providerSubscriptionId: string;
  /** If true, cancel at period end rather than immediately. */
  atPeriodEnd?: boolean;
}

export interface WebhookInput {
  rawBody: Buffer | string;
  headers: Record<string, string | undefined>;
}

export type NormalizedWebhookType =
  | 'subscription.activated'
  | 'subscription.renewed'
  | 'subscription.cancelled'
  | 'subscription.payment_failed'
  | 'unknown';

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

/**
 * Every concrete adapter (Stripe, Paystack, PayPal, store IAP) implements this.
 * Keep it intentionally small — only what subscription billing needs.
 */
export interface PaymentProvider {
  /** Stable provider id, e.g. 'stripe'. */
  readonly name: string;

  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;

  cancelSubscription(input: CancelSubscriptionInput): Promise<void>;

  /** Verify signature AND map the provider payload to a normalized event. */
  verifyAndParseWebhook(input: WebhookInput): Promise<NormalizedWebhookEvent>;

  /** Verify a one-off charge by its provider reference (used to gate activation). */
  verifyTransaction?(reference: string): Promise<VerifyTransactionResult>;
}
