import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  NormalizedWebhookEvent,
  NormalizedWebhookType,
  PaymentProvider,
  WebhookInput,
} from '../payment-provider.interface';

// Stripe's CJS `export =` makes `Stripe` a namespace under nodenext; use the
// instance type via the constructor value instead of `Stripe` as a type.
type StripeClient = InstanceType<typeof Stripe>;

/**
 * Stripe adapter — primary rail for USD/international subscription billing.
 *
 * Uses Checkout Sessions in `subscription` mode with inline `price_data`
 * (no pre-created Price IDs needed) and a trial via `trial_period_days`.
 * Webhooks are verified with the signing secret and normalized for the
 * provider-agnostic SubscriptionsService.applyWebhookEvent path.
 */
@Injectable()
export class StripeAdapter implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeAdapter.name);
  private _stripe: StripeClient | null = null;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private get stripe(): StripeClient {
    if (!this._stripe) {
      const key = this.config.get<string>('STRIPE_SECRET_KEY');
      if (!key) {
        throw new InternalServerErrorException('STRIPE_SECRET_KEY is not configured');
      }
      this._stripe = new Stripe(key);
    }
    return this._stripe;
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: input.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.amount, // minor units
              recurring: {
                interval: input.billingCycle === 'yearly' ? 'year' : 'month',
              },
              product_data: { name: `Planovar ${input.tier}` },
            },
          },
        ],
        subscription_data: {
          ...(input.trialDays ? { trial_period_days: input.trialDays } : {}),
          metadata: {
            vendorId: input.vendorId,
            tier: input.tier,
            ...this.flattenMeta(input.metadata),
          },
        },
        metadata: {
          vendorId: input.vendorId,
          tier: input.tier,
          ...this.flattenMeta(input.metadata),
        },
        success_url:
          input.successUrl ?? 'https://planovar.com/dashboard/subscription?status=success',
        cancel_url:
          input.cancelUrl ?? 'https://planovar.com/dashboard/subscription?status=cancelled',
      });

      return {
        provider: this.name,
        checkoutUrl: session.url ?? undefined,
        // The subscription id is assigned once checkout completes (webhook).
        providerSubscriptionId:
          typeof session.subscription === 'string' ? session.subscription : undefined,
        providerCustomerId:
          typeof session.customer === 'string' ? session.customer : undefined,
        status: 'pending',
        raw: session,
      };
    } catch (err) {
      this.logger.error('Stripe createSubscription failed', err as Error);
      throw new BadRequestException('Failed to initialize Stripe subscription');
    }
  }

  async cancelSubscription(input: CancelSubscriptionInput): Promise<void> {
    if (!input.providerSubscriptionId) return;
    try {
      if (input.atPeriodEnd) {
        await this.stripe.subscriptions.update(input.providerSubscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        await this.stripe.subscriptions.cancel(input.providerSubscriptionId);
      }
    } catch (err) {
      // Best-effort: the caller cancels locally regardless.
      this.logger.warn(`Stripe cancel failed: ${(err as Error).message}`);
    }
  }

  async verifyAndParseWebhook(
    input: WebhookInput,
  ): Promise<NormalizedWebhookEvent> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    const sig = input.headers['stripe-signature'];
    if (!secret || !sig) {
      throw new BadRequestException('Missing Stripe webhook signature/secret');
    }

    let event: ReturnType<StripeClient['webhooks']['constructEvent']>;
    try {
      event = this.stripe.webhooks.constructEvent(input.rawBody, sig, secret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const map: Record<string, NormalizedWebhookType> = {
      'checkout.session.completed': 'subscription.activated',
      'customer.subscription.created': 'subscription.activated',
      'invoice.paid': 'subscription.renewed',
      'customer.subscription.deleted': 'subscription.cancelled',
      'invoice.payment_failed': 'subscription.payment_failed',
    };
    const type = map[event.type] ?? 'unknown';

    const obj = event.data.object as Record<string, any>;
    const providerSubscriptionId =
      typeof obj.subscription === 'string' ? obj.subscription : obj.id;
    const vendorId = obj.metadata?.vendorId;

    return { type, providerSubscriptionId, vendorId, raw: event };
  }

  private flattenMeta(meta?: Record<string, unknown>): Record<string, string> {
    if (!meta) return {};
    return Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [k, String(v)]),
    );
  }
}
