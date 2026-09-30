import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  VerifyTransactionResult,
  WebhookInput,
} from '../payment-provider.interface';

/**
 * Paystack adapter — Nigerian local cards/bank (also supports USD merchants).
 *
 * Phase 1: createSubscription + cancelSubscription are functional (ported from the
 * previous SubscriptionsService Paystack logic). Webhook normalization for the
 * provider-agnostic path is a later refinement; today subscription webhooks still
 * flow through PaymentsService → SubscriptionsService.handleSubscriptionWebhook.
 */
@Injectable()
export class PaystackAdapter implements PaymentProvider {
  readonly name = 'paystack';
  private readonly base = 'https://api.paystack.co';
  private readonly logger = new Logger(PaystackAdapter.name);

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private get secret(): string {
    return this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY');
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.secret}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Resolve the Paystack Plan code for a tier + cycle from env, e.g.
   * PAYSTACK_PLAN_PREMIUM_MONTHLY / PAYSTACK_PLAN_GOLD_YEARLY. When present, the
   * charge becomes a recurring subscription (Paystack auto-creates the
   * subscription after the first successful charge and renews it on the plan's
   * interval). When absent, we fall back to a one-time charge so nothing breaks
   * before the Plans are created.
   */
  private planCodeFor(tier: string, cycle: string): string | undefined {
    const key = `PAYSTACK_PLAN_${tier}_${cycle.toUpperCase()}`;
    const code = this.config.get<string>(key);
    return code && code.trim() ? code.trim() : undefined;
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const debug = process.env.NODE_ENV !== 'production';
    try {
      // If a Plan code is configured for this tier+cycle, pass `plan` so Paystack
      // sets up a recurring subscription; otherwise it's a one-time charge.
      const planCode = this.planCodeFor(input.tier, input.billingCycle);
      const requestBody = {
        email: input.email,
        amount: input.amount, // already in minor units (ignored when `plan` is set)
        currency: input.currency,
        ...(planCode ? { plan: planCode } : {}),
        // Paystack redirects here after payment; the app's in-app WebView
        // watches for this URL to know checkout finished.
        ...(input.successUrl && { callback_url: input.successUrl }),
        metadata: {
          type: 'subscription',
          vendorId: input.vendorId,
          tier: input.tier,
          billingCycle: input.billingCycle,
          ...input.metadata,
        },
      };
      if (debug) {
        this.logger.log(
          `→ Paystack initialize: ${JSON.stringify({
            amount: requestBody.amount,
            currency: requestBody.currency,
            email: requestBody.email,
            callback_url: requestBody.callback_url,
            tier: input.tier,
            recurring: planCode ? `plan ${planCode}` : 'one-time',
          })}`,
        );
      }
      const res = await fetch(`${this.base}/transaction/initialize`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(requestBody),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (debug) {
        this.logger.log(
          `← Paystack initialize (${res.status}): ${JSON.stringify({
            status: data?.status,
            message: data?.message,
            reference: data?.data?.reference,
            checkoutUrl: data?.data?.authorization_url,
          })}`,
        );
      }
      if (!res.ok || !data?.status || !data?.data?.authorization_url) {
        const reason = data?.message ?? `HTTP ${res.status}`;
        this.logger.error(
          `Paystack initialize failed (${res.status}): ${JSON.stringify(data ?? {})}`,
        );
        // 401/invalid-key etc. are config problems, not the client's fault.
        throw new ServiceUnavailableException(
          `Payment provider error: ${reason}. Check PAYSTACK_SECRET_KEY.`,
        );
      }
      return {
        provider: this.name,
        checkoutUrl: data.data.authorization_url as string,
        providerSubscriptionId: data.data.reference as string,
        status: 'pending',
        raw: data.data,
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ServiceUnavailableException
      ) {
        throw err;
      }
      this.logger.error(`Paystack initialize threw: ${err}`);
      throw new ServiceUnavailableException(
        'Could not reach the payment provider. Please try again.',
      );
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    try {
      const res = await fetch(
        `${this.base}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: this.headers() },
      );
      const data = (await res.json().catch(() => null)) as any;
      const status = data?.data?.status as string | undefined; // success | failed | abandoned | ongoing
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(
          `← Paystack verify ${reference} (${res.status}): status=${status} amount=${data?.data?.amount} currency=${data?.data?.currency}`,
        );
      }
      if (status === 'success') return { status: 'success', raw: data.data };
      if (status === 'failed' || status === 'abandoned') {
        return { status: 'failed', raw: data?.data };
      }
      return { status: 'pending', raw: data?.data };
    } catch (err) {
      this.logger.error(`Paystack verify threw: ${err}`);
      return { status: 'pending' };
    }
  }

  async cancelSubscription(input: CancelSubscriptionInput): Promise<void> {
    const code = input.providerSubscriptionId;
    // Only a real Paystack subscription code (SUB_xxx) can be disabled. Before
    // the subscription.create webhook lands we only hold a transaction
    // reference — skip the remote call; the caller cancels locally regardless.
    if (!code || !code.startsWith('SUB_')) return;
    try {
      // Disabling requires the subscription's email_token; fetch it on demand
      // (we don't persist it, to avoid a schema change).
      const res = await fetch(
        `${this.base}/subscription/${encodeURIComponent(code)}`,
        { headers: this.headers() },
      );
      const data = (await res.json().catch(() => null)) as any;
      const token = data?.data?.email_token as string | undefined;
      if (!token) return;
      await fetch(`${this.base}/subscription/disable`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ code, token }),
      });
    } catch {
      // Best-effort: the caller cancels locally regardless.
    }
  }

  verifyAndParseWebhook(
    _input: WebhookInput,
  ): Promise<NormalizedWebhookEvent> {
    // Today Paystack subscription webhooks are handled by
    // SubscriptionsService.handleSubscriptionWebhook (via PaymentsService).
    // Provider-agnostic normalization will move here in a later iteration.
    return Promise.resolve({ type: 'unknown', raw: null });
  }
}
