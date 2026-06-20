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

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const debug = process.env.NODE_ENV !== 'production';
    try {
      const requestBody = {
        email: input.email,
        amount: input.amount, // already in minor units
        currency: input.currency,
        // Paystack redirects here after payment; the app's in-app WebView
        // watches for this URL to know checkout finished.
        ...(input.successUrl && { callback_url: input.successUrl }),
        metadata: {
          type: 'subscription',
          vendorId: input.vendorId,
          tier: input.tier,
          billingCycle: input.billingCycle,
          trialDays: input.trialDays ?? 0,
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
    if (!input.providerSubscriptionId) return;
    try {
      await fetch(`${this.base}/subscription/disable`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          code: input.providerSubscriptionId,
          token: input.providerSubscriptionId,
        }),
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
