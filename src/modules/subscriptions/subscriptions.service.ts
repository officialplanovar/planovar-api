import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

// Free-trial length for a vendor's first paid subscription (MoM #18).
const TRIAL_DAYS = 45;
// Grace window before a lapsed paid subscription is force-expired by the sweeper
// (covers a delayed/missed renewal webhook).
const RENEWAL_GRACE_DAYS = 3;

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly billing: PaymentProvider,
  ) {}

  // ─── Scheduled: expire lapsed subscriptions ────────────────────────────────
  // Renewals/expiry are normally driven by provider webhooks. This nightly
  // sweeper is the safety net: it force-expires PAID subscriptions whose access
  // window has clearly ended (trial over, non-renewing period ended, or a
  // renewal that never confirmed within the grace window) and drops the vendor
  // to BASIC. BASIC (free) subscriptions are never expired.
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async expireLapsedSubscriptions() {
    const now = new Date();
    const graceCutoff = new Date(
      now.getTime() - RENEWAL_GRACE_DAYS * 24 * 60 * 60 * 1000,
    );

    const candidates = await this.prisma.vendorSubscription.findMany({
      where: {
        plan: { tier: { not: SubscriptionTier.BASIC } },
        OR: [
          // Free trial ended without converting to a paid charge.
          { status: SubscriptionStatus.TRIALING, trialEndsAt: { lt: now } },
          // Cancelled (won't renew) and the paid period has now ended.
          {
            status: SubscriptionStatus.ACTIVE,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: { lt: now },
          },
          // Failed charge whose retries are exhausted (no disable webhook came).
          {
            status: SubscriptionStatus.PAST_DUE,
            currentPeriodEnd: { lt: graceCutoff },
          },
          // Active but the renewal never confirmed within the grace window.
          {
            status: SubscriptionStatus.ACTIVE,
            cancelAtPeriodEnd: false,
            currentPeriodEnd: { lt: graceCutoff },
          },
        ],
      },
      select: { id: true, vendorId: true },
    });
    if (candidates.length === 0) return;

    let expired = 0;
    for (const sub of candidates) {
      // Don't downgrade a vendor who has a newer active/trialing sub (e.g. they
      // upgraded and this is the stale old one).
      const other = await this.prisma.vendorSubscription.findFirst({
        where: {
          vendorId: sub.vendorId,
          id: { not: sub.id },
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
        },
        select: { id: true },
      });
      await this.prisma.$transaction([
        this.prisma.vendorSubscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.EXPIRED, cancelledAt: now },
        }),
        ...(other
          ? []
          : [
              this.prisma.vendorProfile.update({
                where: { id: sub.vendorId },
                data: { subscriptionTier: SubscriptionTier.BASIC },
              }),
            ]),
      ]);
      expired++;
    }
    this.logger.log(`Expired ${expired} lapsed subscription(s).`);
  }

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

    // No paid/trial sub → the vendor is on the free BASIC floor. Self-heal by
    // lazily creating a BASIC subscription so /me always returns a real plan
    // (previously this 404'd for freshly-onboarded vendors).
    if (!subscription) {
      const basic = await this.ensureBasicSubscription(vendor.id);
      return {
        ...basic,
        plan: basic.plan ? this.withBillingCurrency(basic.plan) : basic.plan,
      };
    }
    return {
      ...subscription,
      plan: subscription.plan
        ? this.withBillingCurrency(subscription.plan)
        : subscription.plan,
    };
  }

  /**
   * Ensure the vendor has a BASIC subscription row (the free floor) and return
   * it in the same shape as getMySubscription. Idempotent.
   */
  private async ensureBasicSubscription(vendorId: string) {
    const select = {
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
    } as const;

    const existing = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        status: SubscriptionStatus.ACTIVE,
        plan: { tier: SubscriptionTier.BASIC },
      },
      orderBy: { createdAt: 'desc' },
      select,
    });
    if (existing) return existing;

    const basicPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier: SubscriptionTier.BASIC },
      select: { id: true },
    });
    if (!basicPlan) {
      throw new NotFoundException('BASIC plan is not configured');
    }

    const now = new Date();
    const [created] = await this.prisma.$transaction([
      this.prisma.vendorSubscription.create({
        data: {
          vendorId,
          planId: basicPlan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: now,
          currentPeriodEnd: addMonths(now, 1),
        },
        select,
      }),
      this.prisma.vendorProfile.update({
        where: { id: vendorId },
        data: { subscriptionTier: SubscriptionTier.BASIC },
      }),
    ]);
    return created;
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

    // Paid (Premium/Gold).
    const pricing = this.priceInBillingCurrency(
      Number(plan.priceMonthly),
      Number(plan.priceYearly),
    );
    const newPrice =
      billingCycle === BillingCycle.YEARLY
        ? pricing.priceYearly
        : pricing.priceMonthly;
    const periodEnd =
      billingCycle === BillingCycle.YEARLY ? addMonths(now, 12) : addMonths(now, 1);

    // ── First paid subscription → 45-day free trial. The vendor gets the paid
    //    tier now and is not charged; TrialClaim (vendor / device / phone)
    //    prevents farming the trial across accounts. At trial end the nightly
    //    sweeper drops them to BASIC unless they've subscribed (paid).
    //    NOTE: charging a card up-front to auto-convert at trial end needs a
    //    provider card-authorization flow (Paystack) — tracked separately; the
    //    trialDays signal is already plumbed through the billing interface.
    if (await this.isTrialEligible(vendor.id, user.phone, deviceId)) {
      const trialEndsAt = addDays(now, TRIAL_DAYS);
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
            status: SubscriptionStatus.TRIALING,
            billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            trialEndsAt,
          },
        }),
        this.prisma.vendorProfile.update({
          where: { id: vendor.id },
          data: { subscriptionTier: plan.tier },
        }),
        this.prisma.trialClaim.create({
          data: {
            vendorId: vendor.id,
            deviceId: deviceId ?? null,
            phone: user.phone ?? null,
          },
        }),
      );
      await this.prisma.$transaction(ops);
      return { status: 'trialing', tier: plan.tier, trialEndsAt };
    }

    // ── Upgrade / downgrade with proration: credit the unused value of the
    //    vendor's current paid tier against the new tier's price so they only
    //    pay the difference (Paystack recurring doesn't prorate natively, so
    //    this is applied as a one-time difference charge).
    const credit = await this.proratedCredit(vendor.id, now);
    const chargeAmount = Math.max(0, Math.round((newPrice - credit) * 100) / 100);
    const amountMinor = Math.round(chargeAmount * 100);

    // Fully covered by the credit (e.g. downgrade to a cheaper paid tier) →
    // switch immediately, no checkout. The forfeited excess is not refunded.
    if (amountMinor === 0) {
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
            currentPeriodEnd: periodEnd,
          },
        }),
        this.prisma.vendorProfile.update({
          where: { id: vendor.id },
          data: { subscriptionTier: plan.tier },
        }),
      );
      await this.prisma.$transaction(ops);
      return { status: 'active', tier: plan.tier, prorationCredit: credit };
    }

    // Charge the prorated difference FIRST via a PENDING (PAST_DUE) subscription;
    // the current plan stays active until POST /subscriptions/verify confirms
    // the payment, which then activates this one and cancels the old.
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
      metadata: { planId: plan.id, userId, prorationCredit: credit },
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
      prorationCredit: credit,
      amountCharged: chargeAmount,
    };
  }

  /** First-paid-subscription check for trial eligibility, with anti-abuse. */
  private async isTrialEligible(
    vendorId: string,
    phone?: string | null,
    deviceId?: string | null,
  ): Promise<boolean> {
    const claim = await this.prisma.trialClaim.findFirst({
      where: {
        OR: [
          { vendorId },
          ...(deviceId ? [{ deviceId }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
      select: { id: true },
    });
    if (claim) return false;
    // Never had any paid (non-BASIC) subscription before.
    const priorPaid = await this.prisma.vendorSubscription.findFirst({
      where: { vendorId, plan: { tier: { not: SubscriptionTier.BASIC } } },
      select: { id: true },
    });
    return !priorPaid;
  }

  /**
   * Unused value of the vendor's current ACTIVE paid tier, in the active
   * billing currency, as a proration credit toward an upgrade/downgrade.
   * Returns 0 when the vendor is on BASIC or has no remaining period.
   */
  private async proratedCredit(vendorId: string, now: Date): Promise<number> {
    const current = await this.prisma.vendorSubscription.findFirst({
      where: {
        vendorId,
        status: SubscriptionStatus.ACTIVE,
        plan: { tier: { not: SubscriptionTier.BASIC } },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        currentPeriodStart: true,
        currentPeriodEnd: true,
        billingCycle: true,
        plan: { select: { priceMonthly: true, priceYearly: true } },
      },
    });
    if (!current) return 0;

    const periodMs =
      current.currentPeriodEnd.getTime() - current.currentPeriodStart.getTime();
    const remainingMs = current.currentPeriodEnd.getTime() - now.getTime();
    if (periodMs <= 0 || remainingMs <= 0) return 0;
    const fraction = Math.min(1, remainingMs / periodMs);

    const ngnPeriodPrice =
      current.billingCycle === BillingCycle.YEARLY
        ? Number(current.plan.priceYearly)
        : Number(current.plan.priceMonthly);
    // Convert the NGN period price into the billing currency (pass as both args;
    // priceMonthly of the result is the converted single value).
    const converted = this.priceInBillingCurrency(ngnPeriodPrice, ngnPeriodPrice);
    return Math.round(converted.priceMonthly * fraction * 100) / 100;
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

    // SECURITY: the presented reference must belong to THIS vendor's own
    // subscription checkout. Without this, a vendor could unlock an expensive
    // tier by presenting ANY unrelated successful Paystack reference (e.g. a
    // trivial ₦50 charge). Two independent bindings, either of which is
    // sufficient:
    //  (a) the reference matches a subscription row we created for this vendor
    //      (its providerSubscriptionId). Because that reference was initialized
    //      with the exact prorated amount, a successful charge on it IS the
    //      correct amount — Paystack won't accept a different amount for it.
    //  (b) the verified transaction carries the subscription metadata we set at
    //      initialize (type=subscription + this vendor's id). This covers the
    //      recurring case where the `subscription.create` webhook has already
    //      rewritten the stored reference to a SUB_xxx code.
    const meta = (
      verified.raw as
        | { metadata?: { type?: string; vendorId?: string } }
        | undefined
    )?.metadata;
    const metaMatchesVendor =
      meta?.type === 'subscription' && meta?.vendorId === vendor.id;

    const byReference = await this.prisma.vendorSubscription.findFirst({
      where: { vendorId: vendor.id, providerSubscriptionId: reference },
      select: { id: true },
    });

    if (!byReference && !metaMatchesVendor) {
      throw new BadRequestException(
        'Payment reference does not match a pending subscription for this account',
      );
    }

    // The pending sub to activate. With recurring billing the
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
