import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillingCycle, Prisma, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PAYMENT_PROVIDER } from '../billing/payment-provider.interface';
import type {
  NormalizedWebhookEvent,
  PaymentProvider,
  PaidTier,
} from '../billing/payment-provider.interface';
import { SubscribeDto } from './dto/subscribe.dto';

// ─── In-memory plan cache ─────────────────────────────────────────────────────
const PLAN_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const planCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = planCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    planCache.delete(key);
    return null;
  }
  return entry.data as T;
}
function setCache<T>(key: string, data: T, ttlMs: number): void {
  planCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_PUBLIC_SELECT = {
  id: true,
  tier: true,
  name: true,
  priceMonthly: true,
  priceYearly: true,
  currency: true,
  listingLimit: true,
  features: true,
} as const;

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly billing: PaymentProvider,
  ) {}

  // ─── Currency: plans are stored in NGN (Paystack). For Stripe (USD merchant)
  //     we recalculate to USD at NGN_TO_USD_RATE so prices display/charge in $.
  private get billingCurrency(): 'NGN' | 'USD' {
    const provider = String(process.env.PAYMENT_PROVIDER ?? 'paystack').toLowerCase();
    return provider === 'stripe' ? 'USD' : 'NGN';
  }

  private priceInBillingCurrency(ngnMonthly: number, ngnYearly: number) {
    if (this.billingCurrency === 'USD') {
      const rate = Number(process.env.NGN_TO_USD_RATE) || 1600; // 1 USD ≈ ₦1600
      const usd = (n: number) => Math.round((n / rate) * 100) / 100;
      return { currency: 'USD', priceMonthly: usd(ngnMonthly), priceYearly: usd(ngnYearly) };
    }
    return { currency: 'NGN', priceMonthly: ngnMonthly, priceYearly: ngnYearly };
  }

  /** Re-express a plan object's price/currency in the active billing currency. */
  private withBillingCurrency<
    T extends { priceMonthly: unknown; priceYearly: unknown; currency: string },
  >(plan: T): T {
    const p = this.priceInBillingCurrency(
      Number(plan.priceMonthly),
      Number(plan.priceYearly),
    );
    return { ...plan, priceMonthly: p.priceMonthly, priceYearly: p.priceYearly, currency: p.currency };
  }

  // ─── Public: list subscription plans ──────────────────────────────────────

  async listPlans() {
    const cacheKey = `subscription_plans_${this.billingCurrency}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' },
      select: PLAN_PUBLIC_SELECT,
    });
    const converted = plans.map((p) => this.withBillingCurrency(p));

    setCache(cacheKey, converted, PLAN_CACHE_TTL_MS);
    return converted;
  }

  // ─── Vendor: get own active subscription ──────────────────────────────────

  async getMySubscription(userId: string) {
    const vendor = await this.requireVendor(userId);

    const subscription = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId: vendor.id,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        billingCycle: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        cancelAtPeriodEnd: true,
        provider: true,
        cancelledAt: true,
        createdAt: true,
        plan: { select: PLAN_PUBLIC_SELECT },
      },
    });

    if (!subscription) throw new NotFoundException('No active subscription found');
    return {
      ...subscription,
      plan: subscription.plan
        ? this.withBillingCurrency(subscription.plan)
        : subscription.plan,
    };
  }

  // ─── Vendor: subscribe to a plan ──────────────────────────────────────────

  async subscribe(userId: string, dto: SubscribeDto, deviceId?: string) {
    const vendor = await this.requireVendor(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });
    if (!user?.email) throw new BadRequestException('User email not found');

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
      select: {
        id: true,
        tier: true,
        name: true,
        priceMonthly: true,
        priceYearly: true,
        currency: true,
      },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const active = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId: vendor.id,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, planId: true },
    });
    if (active?.planId === plan.id) {
      return this.getMySubscription(userId);
    }

    const billingCycle = dto.billingCycle ?? BillingCycle.MONTHLY;
    const now = new Date();

    // Basic (free): switch immediately — end the old plan, activate Basic.
    if (plan.tier === SubscriptionTier.BASIC) {
      const ops: Prisma.PrismaPromise<unknown>[] = [];
      if (active) {
        ops.push(
          this.prisma.vendorSubscription.update({
            where: { id: active.id },
            data: {
              status: SubscriptionStatus.CANCELLED,
              cancelAtPeriodEnd: false,
              cancelledAt: now,
            },
          }),
        );
      }
      ops.push(
        this.prisma.vendorSubscription.create({
          data: {
            vendorId: vendor.id,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: addMonths(now, 1),
          },
        }),
        this.prisma.vendorProfile.update({
          where: { id: vendor.id },
          data: { subscriptionTier: SubscriptionTier.BASIC },
        }),
      );
      await this.prisma.$transaction(ops);
      return { status: 'active', tier: plan.tier };
    }

    // Paid (Premium/Gold): charge FIRST. We create a PENDING subscription
    // (PAST_DUE — invisible to /me) and hand off to the provider. The vendor's
    // plan does NOT change and the current plan stays active until the payment
    // is verified (POST /subscriptions/verify), which then activates this one
    // and cancels the old one.
    const pricing = this.priceInBillingCurrency(
      Number(plan.priceMonthly),
      Number(plan.priceYearly),
    );
    const price =
      billingCycle === BillingCycle.YEARLY
        ? pricing.priceYearly
        : pricing.priceMonthly;
    const amountMinor = Math.round(price * 100);
    const periodEnd =
      billingCycle === BillingCycle.YEARLY ? addMonths(now, 12) : addMonths(now, 1);

    const result = await this.billing.createSubscription({
      vendorId: vendor.id,
      email: user.email,
      tier: plan.tier as PaidTier,
      billingCycle: billingCycle === BillingCycle.YEARLY ? 'yearly' : 'monthly',
      amount: amountMinor,
      currency: pricing.currency,
      trialDays: 0,
      successUrl: dto.callbackUrl,
      cancelUrl: dto.callbackUrl,
      metadata: { planId: plan.id, userId },
    });

    await this.prisma.vendorSubscription.create({
      data: {
        vendorId: vendor.id,
        planId: plan.id,
        status: SubscriptionStatus.PAST_DUE, // pending payment
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        provider: result.provider,
        providerSubscriptionId: result.providerSubscriptionId,
      },
    });

    return {
      status: 'pending',
      tier: plan.tier,
      checkoutUrl: result.checkoutUrl,
      reference: result.providerSubscriptionId,
    };
  }

  /**
   * Verify a paid subscription's payment by its provider reference. On success:
   * activates the pending subscription, cancels the previous one, and switches
   * the vendor's tier. Until this succeeds the vendor stays on their old plan.
   */
  async verifyPayment(userId: string, reference: string) {
    const vendor = await this.requireVendor(userId);
    if (!this.billing.verifyTransaction) {
      throw new BadRequestException('Payment verification is not supported');
    }

    const verified = await this.billing.verifyTransaction(reference);

    // Find the pending sub for this checkout. With recurring billing the
    // `subscription.create` webhook can land first — activating the sub and
    // replacing the reference with the Paystack subscription code — so match the
    // vendor's latest PAST_DUE sub rather than requiring a reference match.
    const pending = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId: vendor.id,
        status: SubscriptionStatus.PAST_DUE,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        billingCycle: true,
        plan: { select: { tier: true } },
      },
    });

    if (verified.status === 'failed') {
      if (pending) {
        await this.prisma.vendorSubscription.update({
          where: { id: pending.id },
          data: { status: SubscriptionStatus.EXPIRED },
        });
      }
      throw new BadRequestException('Payment was not successful');
    }
    if (verified.status !== 'success') {
      return { status: 'pending' };
    }
    if (!pending) {
      // The webhook already activated this subscription — idempotent success.
      return this.getMySubscription(userId);
    }

    const now = new Date();
    const periodEnd =
      pending.billingCycle === BillingCycle.YEARLY
        ? addMonths(now, 12)
        : addMonths(now, 1);

    await this.prisma.$transaction([
      // End the previous plan(s).
      this.prisma.vendorSubscription.updateMany({
        where: {
          vendorId: vendor.id,
          id: { not: pending.id },
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelAtPeriodEnd: false,
          cancelledAt: now,
        },
      }),
      this.prisma.vendorSubscription.update({
        where: { id: pending.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      }),
      this.prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { subscriptionTier: pending.plan.tier },
      }),
    ]);

    return this.getMySubscription(userId);
  }

  /**
   * Switch/upgrade to a different plan. `subscribe` already handles this safely:
   * free plans switch immediately; paid plans create a pending subscription +
   * checkout and only take effect on payment verification (keeping the old plan
   * active until then). No-op if already on that plan.
   */
  changePlan(userId: string, dto: SubscribeDto, deviceId?: string) {
    return this.subscribe(userId, dto, deviceId);
  }

  // ─── Vendor: cancel subscription (stays active until period end) ───────────

  async cancelSubscription(userId: string) {
    const vendor = await this.requireVendor(userId);

    const subscription = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId: vendor.id,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, provider: true, providerSubscriptionId: true },
    });
    if (!subscription) throw new NotFoundException('No active subscription to cancel');

    if (subscription.providerSubscriptionId) {
      await this.billing.cancelSubscription({
        providerSubscriptionId: subscription.providerSubscriptionId,
        atPeriodEnd: true,
      });
    }

    await this.prisma.vendorSubscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true, cancelledAt: new Date() },
    });

    return {
      message:
        'Subscription will not renew. Your plan stays active until the end of the current period.',
    };
  }

  // ─── Webhook: subscription lifecycle (Paystack-shaped, via PaymentsService) ─
  // Provider-agnostic normalization will move into the adapters later.

  async handleSubscriptionWebhook(event: { event: string; data: any }) {
    const { event: eventType, data } = event;
    try {
      switch (eventType) {
        case 'subscription.create':
          await this.handleSubscriptionCreate(data);
          break;
        case 'invoice.update':
          // Successful recurring charge — roll the period forward.
          await this.handleInvoiceUpdate(data);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(data);
          break;
        case 'subscription.not_renew':
          await this.handleSubscriptionNotRenew(data);
          break;
        case 'subscription.disable':
          await this.handleSubscriptionDisable(data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error processing subscription webhook ${eventType}:`, err);
    }
  }

  private async handleSubscriptionCreate(data: any) {
    const providerSubscriptionId: string = data.subscription_code;
    const customerEmail: string | undefined = data.customer?.email;
    if (!customerEmail) return;

    const user = await this.prisma.user.findUnique({
      where: { email: customerEmail },
      select: { id: true },
    });
    if (!user) return;

    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return;

    const existingSub = await this.prisma.vendorSubscription.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        planId: true,
        billingCycle: true,
        plan: { select: { tier: true } },
      },
    });
    if (!existingSub) return;

    const now = new Date();
    const periodEnd =
      existingSub.billingCycle === BillingCycle.YEARLY
        ? addMonths(now, 12)
        : addMonths(now, 1);
    await this.prisma.$transaction([
      this.prisma.vendorSubscription.update({
        where: { id: existingSub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          provider: 'paystack',
          providerSubscriptionId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      }),
      this.prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { subscriptionTier: existingSub.plan.tier },
      }),
    ]);
  }

  /** A recurring charge succeeded — keep ACTIVE and roll the period forward. */
  private async handleInvoiceUpdate(data: any) {
    const paid = data?.paid === true || data?.status === 'success';
    const providerSubscriptionId: string | undefined =
      data?.subscription?.subscription_code;
    if (!paid || !providerSubscriptionId) return;

    const sub = await this.prisma.vendorSubscription.findFirst({
      where: { providerSubscriptionId },
      select: {
        id: true,
        billingCycle: true,
        vendorId: true,
        plan: { select: { tier: true } },
      },
    });
    if (!sub) return;

    const now = new Date();
    const periodEnd =
      sub.billingCycle === BillingCycle.YEARLY
        ? addMonths(now, 12)
        : addMonths(now, 1);
    await this.prisma.$transaction([
      this.prisma.vendorSubscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      }),
      // Re-assert the tier in case a prior failed charge had downgraded it.
      this.prisma.vendorProfile.update({
        where: { id: sub.vendorId },
        data: { subscriptionTier: sub.plan.tier },
      }),
    ]);
  }

  private async handleInvoicePaymentFailed(data: any) {
    const providerSubscriptionId: string | undefined =
      data.subscription?.subscription_code;
    if (!providerSubscriptionId) return;

    // Transient: Paystack will retry. Mark PAST_DUE but keep the tier during the
    // retry grace; a terminal failure arrives as subscription.disable (→ BASIC).
    await this.prisma.vendorSubscription.updateMany({
      where: { providerSubscriptionId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  /** Paystack won't renew (card removed / cancelled) — flag end-of-period. */
  private async handleSubscriptionNotRenew(data: any) {
    const providerSubscriptionId: string | undefined = data?.subscription_code;
    if (!providerSubscriptionId) return;
    await this.prisma.vendorSubscription.updateMany({
      where: { providerSubscriptionId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  private async handleSubscriptionDisable(data: any) {
    const providerSubscriptionId: string | undefined = data.subscription_code;
    if (!providerSubscriptionId) return;

    const subscription = await this.prisma.vendorSubscription.findFirst({
      where: { providerSubscriptionId },
      select: { id: true, vendorId: true },
    });
    if (!subscription) return;

    await this.prisma.$transaction([
      this.prisma.vendorSubscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.EXPIRED, cancelledAt: new Date() },
      }),
      this.prisma.vendorProfile.update({
        where: { id: subscription.vendorId },
        data: { subscriptionTier: SubscriptionTier.BASIC },
      }),
    ]);
  }

  // ─── Provider-agnostic webhook (Stripe / future rails) ────────────────────

  /** Verify + apply a billing-provider webhook for the active PAYMENT_PROVIDER. */
  async handleProviderWebhook(
    rawBody: Buffer | string,
    headers: Record<string, string | undefined>,
  ) {
    const event = await this.billing.verifyAndParseWebhook({ rawBody, headers });
    await this.applyWebhookEvent(event);
    return { received: true };
  }

  /** Map a normalized billing event onto the local subscription + vendor tier. */
  async applyWebhookEvent(event: NormalizedWebhookEvent) {
    const now = new Date();

    if (event.type === 'subscription.activated') {
      // Match by provider id if known, else by vendor (record created pre-checkout).
      const sub = event.providerSubscriptionId
        ? await this.prisma.vendorSubscription.findFirst({
            where: { providerSubscriptionId: event.providerSubscriptionId },
            select: { id: true, vendorId: true, plan: { select: { tier: true } } },
          })
        : event.vendorId
          ? await this.prisma.vendorSubscription.findFirst({
              where: {
                vendorId: event.vendorId,
                status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE] },
              },
              orderBy: { createdAt: 'desc' },
              select: { id: true, vendorId: true, plan: { select: { tier: true } } },
            })
          : null;
      if (!sub) return;

      await this.prisma.$transaction([
        this.prisma.vendorSubscription.update({
          where: { id: sub.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            provider: this.billing.name,
            ...(event.providerSubscriptionId && {
              providerSubscriptionId: event.providerSubscriptionId,
            }),
          },
        }),
        this.prisma.vendorProfile.update({
          where: { id: sub.vendorId },
          data: { subscriptionTier: sub.plan.tier },
        }),
      ]);
      return;
    }

    if (!event.providerSubscriptionId) return;

    if (event.type === 'subscription.renewed') {
      await this.prisma.vendorSubscription.updateMany({
        where: { providerSubscriptionId: event.providerSubscriptionId },
        data: { status: SubscriptionStatus.ACTIVE, currentPeriodEnd: addMonths(now, 1) },
      });
      return;
    }

    if (event.type === 'subscription.payment_failed') {
      await this.prisma.vendorSubscription.updateMany({
        where: { providerSubscriptionId: event.providerSubscriptionId },
        data: { status: SubscriptionStatus.PAST_DUE },
      });
      return;
    }

    if (event.type === 'subscription.cancelled') {
      const sub = await this.prisma.vendorSubscription.findFirst({
        where: { providerSubscriptionId: event.providerSubscriptionId },
        select: { id: true, vendorId: true },
      });
      if (!sub) return;
      await this.prisma.$transaction([
        this.prisma.vendorSubscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.EXPIRED, cancelledAt: now },
        }),
        this.prisma.vendorProfile.update({
          where: { id: sub.vendorId },
          data: { subscriptionTier: SubscriptionTier.BASIC },
        }),
      ]);
    }
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  private async requireVendor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found — onboard first');
    return vendor;
  }
}
