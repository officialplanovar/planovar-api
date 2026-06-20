"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_provider_interface_1 = require("../billing/payment-provider.interface");
const PLAN_CACHE_TTL_MS = 60 * 60 * 1000;
const planCache = new Map();
function getCached(key) {
    const entry = planCache.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        planCache.delete(key);
        return null;
    }
    return entry.data;
}
function setCache(key, data, ttlMs) {
    planCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
function addDays(base, days) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
}
function addMonths(base, months) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + months);
    return d;
}
const PLAN_PUBLIC_SELECT = {
    id: true,
    tier: true,
    name: true,
    priceMonthly: true,
    priceYearly: true,
    currency: true,
    listingLimit: true,
    features: true,
};
let SubscriptionsService = class SubscriptionsService {
    prisma;
    billing;
    constructor(prisma, billing) {
        this.prisma = prisma;
        this.billing = billing;
    }
    get billingCurrency() {
        const provider = String(process.env.PAYMENT_PROVIDER ?? 'paystack').toLowerCase();
        return provider === 'stripe' ? 'USD' : 'NGN';
    }
    priceInBillingCurrency(ngnMonthly, ngnYearly) {
        if (this.billingCurrency === 'USD') {
            const rate = Number(process.env.NGN_TO_USD_RATE) || 1600;
            const usd = (n) => Math.round((n / rate) * 100) / 100;
            return { currency: 'USD', priceMonthly: usd(ngnMonthly), priceYearly: usd(ngnYearly) };
        }
        return { currency: 'NGN', priceMonthly: ngnMonthly, priceYearly: ngnYearly };
    }
    withBillingCurrency(plan) {
        const p = this.priceInBillingCurrency(Number(plan.priceMonthly), Number(plan.priceYearly));
        return { ...plan, priceMonthly: p.priceMonthly, priceYearly: p.priceYearly, currency: p.currency };
    }
    async listPlans() {
        const cacheKey = `subscription_plans_${this.billingCurrency}`;
        const cached = getCached(cacheKey);
        if (cached)
            return cached;
        const plans = await this.prisma.subscriptionPlan.findMany({
            orderBy: { priceMonthly: 'asc' },
            select: PLAN_PUBLIC_SELECT,
        });
        const converted = plans.map((p) => this.withBillingCurrency(p));
        setCache(cacheKey, converted, PLAN_CACHE_TTL_MS);
        return converted;
    }
    async getMySubscription(userId) {
        const vendor = await this.requireVendor(userId);
        const subscription = await this.prisma.vendorSubscription.findFirst({
            where: {
                vendorId: vendor.id,
                status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING] },
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
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
        return {
            ...subscription,
            plan: subscription.plan
                ? this.withBillingCurrency(subscription.plan)
                : subscription.plan,
        };
    }
    async subscribe(userId, dto, deviceId) {
        const vendor = await this.requireVendor(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, phone: true },
        });
        if (!user?.email)
            throw new common_1.BadRequestException('User email not found');
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
        if (!plan)
            throw new common_1.NotFoundException('Subscription plan not found');
        const active = await this.prisma.vendorSubscription.findFirst({
            where: {
                vendorId: vendor.id,
                status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING] },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true, planId: true },
        });
        if (active?.planId === plan.id) {
            return this.getMySubscription(userId);
        }
        const billingCycle = dto.billingCycle ?? client_1.BillingCycle.MONTHLY;
        const now = new Date();
        if (plan.tier === client_1.SubscriptionTier.BASIC) {
            const ops = [];
            if (active) {
                ops.push(this.prisma.vendorSubscription.update({
                    where: { id: active.id },
                    data: {
                        status: client_1.SubscriptionStatus.CANCELLED,
                        cancelAtPeriodEnd: false,
                        cancelledAt: now,
                    },
                }));
            }
            ops.push(this.prisma.vendorSubscription.create({
                data: {
                    vendorId: vendor.id,
                    planId: plan.id,
                    status: client_1.SubscriptionStatus.ACTIVE,
                    billingCycle,
                    currentPeriodStart: now,
                    currentPeriodEnd: addMonths(now, 1),
                },
            }), this.prisma.vendorProfile.update({
                where: { id: vendor.id },
                data: { subscriptionTier: client_1.SubscriptionTier.BASIC },
            }));
            await this.prisma.$transaction(ops);
            return { status: 'active', tier: plan.tier };
        }
        const pricing = this.priceInBillingCurrency(Number(plan.priceMonthly), Number(plan.priceYearly));
        const price = billingCycle === client_1.BillingCycle.YEARLY
            ? pricing.priceYearly
            : pricing.priceMonthly;
        const amountMinor = Math.round(price * 100);
        const periodEnd = billingCycle === client_1.BillingCycle.YEARLY ? addMonths(now, 12) : addMonths(now, 1);
        const result = await this.billing.createSubscription({
            vendorId: vendor.id,
            email: user.email,
            tier: plan.tier,
            billingCycle: billingCycle === client_1.BillingCycle.YEARLY ? 'yearly' : 'monthly',
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
                status: client_1.SubscriptionStatus.PAST_DUE,
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
    async verifyPayment(userId, reference) {
        const vendor = await this.requireVendor(userId);
        if (!this.billing.verifyTransaction) {
            throw new common_1.BadRequestException('Payment verification is not supported');
        }
        const pending = await this.prisma.vendorSubscription.findFirst({
            where: {
                vendorId: vendor.id,
                providerSubscriptionId: reference,
                status: client_1.SubscriptionStatus.PAST_DUE,
            },
            select: {
                id: true,
                billingCycle: true,
                plan: { select: { tier: true } },
            },
        });
        if (!pending) {
            throw new common_1.NotFoundException('No pending subscription for this reference');
        }
        const verified = await this.billing.verifyTransaction(reference);
        if (verified.status === 'failed') {
            await this.prisma.vendorSubscription.update({
                where: { id: pending.id },
                data: { status: client_1.SubscriptionStatus.EXPIRED },
            });
            throw new common_1.BadRequestException('Payment was not successful');
        }
        if (verified.status !== 'success') {
            return { status: 'pending' };
        }
        const now = new Date();
        const periodEnd = pending.billingCycle === client_1.BillingCycle.YEARLY
            ? addMonths(now, 12)
            : addMonths(now, 1);
        await this.prisma.$transaction([
            this.prisma.vendorSubscription.updateMany({
                where: {
                    vendorId: vendor.id,
                    id: { not: pending.id },
                    status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING] },
                },
                data: {
                    status: client_1.SubscriptionStatus.CANCELLED,
                    cancelAtPeriodEnd: false,
                    cancelledAt: now,
                },
            }),
            this.prisma.vendorSubscription.update({
                where: { id: pending.id },
                data: {
                    status: client_1.SubscriptionStatus.ACTIVE,
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
    changePlan(userId, dto, deviceId) {
        return this.subscribe(userId, dto, deviceId);
    }
    async cancelSubscription(userId) {
        const vendor = await this.requireVendor(userId);
        const subscription = await this.prisma.vendorSubscription.findFirst({
            where: {
                vendorId: vendor.id,
                status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING] },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true, provider: true, providerSubscriptionId: true },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription to cancel');
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
            message: 'Subscription will not renew. Your plan stays active until the end of the current period.',
        };
    }
    async handleSubscriptionWebhook(event) {
        const { event: eventType, data } = event;
        try {
            switch (eventType) {
                case 'subscription.create':
                    await this.handleSubscriptionCreate(data);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(data);
                    break;
                case 'subscription.disable':
                    await this.handleSubscriptionDisable(data);
                    break;
                default:
                    break;
            }
        }
        catch (err) {
            console.error(`Error processing subscription webhook ${eventType}:`, err);
        }
    }
    async handleSubscriptionCreate(data) {
        const providerSubscriptionId = data.subscription_code;
        const customerEmail = data.customer?.email;
        if (!customerEmail)
            return;
        const user = await this.prisma.user.findUnique({
            where: { email: customerEmail },
            select: { id: true },
        });
        if (!user)
            return;
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!vendor)
            return;
        const existingSub = await this.prisma.vendorSubscription.findFirst({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true, planId: true, plan: { select: { tier: true } } },
        });
        if (!existingSub)
            return;
        const now = new Date();
        await this.prisma.$transaction([
            this.prisma.vendorSubscription.update({
                where: { id: existingSub.id },
                data: {
                    status: client_1.SubscriptionStatus.ACTIVE,
                    provider: 'paystack',
                    providerSubscriptionId,
                    currentPeriodStart: now,
                    currentPeriodEnd: addMonths(now, 1),
                },
            }),
            this.prisma.vendorProfile.update({
                where: { id: vendor.id },
                data: { subscriptionTier: existingSub.plan.tier },
            }),
        ]);
    }
    async handleInvoicePaymentFailed(data) {
        const providerSubscriptionId = data.subscription?.subscription_code;
        if (!providerSubscriptionId)
            return;
        await this.prisma.vendorSubscription.updateMany({
            where: { providerSubscriptionId },
            data: { status: client_1.SubscriptionStatus.PAST_DUE },
        });
    }
    async handleSubscriptionDisable(data) {
        const providerSubscriptionId = data.subscription_code;
        if (!providerSubscriptionId)
            return;
        const subscription = await this.prisma.vendorSubscription.findFirst({
            where: { providerSubscriptionId },
            select: { id: true, vendorId: true },
        });
        if (!subscription)
            return;
        await this.prisma.$transaction([
            this.prisma.vendorSubscription.update({
                where: { id: subscription.id },
                data: { status: client_1.SubscriptionStatus.EXPIRED, cancelledAt: new Date() },
            }),
            this.prisma.vendorProfile.update({
                where: { id: subscription.vendorId },
                data: { subscriptionTier: client_1.SubscriptionTier.BASIC },
            }),
        ]);
    }
    async handleProviderWebhook(rawBody, headers) {
        const event = await this.billing.verifyAndParseWebhook({ rawBody, headers });
        await this.applyWebhookEvent(event);
        return { received: true };
    }
    async applyWebhookEvent(event) {
        const now = new Date();
        if (event.type === 'subscription.activated') {
            const sub = event.providerSubscriptionId
                ? await this.prisma.vendorSubscription.findFirst({
                    where: { providerSubscriptionId: event.providerSubscriptionId },
                    select: { id: true, vendorId: true, plan: { select: { tier: true } } },
                })
                : event.vendorId
                    ? await this.prisma.vendorSubscription.findFirst({
                        where: {
                            vendorId: event.vendorId,
                            status: { in: [client_1.SubscriptionStatus.TRIALING, client_1.SubscriptionStatus.PAST_DUE] },
                        },
                        orderBy: { createdAt: 'desc' },
                        select: { id: true, vendorId: true, plan: { select: { tier: true } } },
                    })
                    : null;
            if (!sub)
                return;
            await this.prisma.$transaction([
                this.prisma.vendorSubscription.update({
                    where: { id: sub.id },
                    data: {
                        status: client_1.SubscriptionStatus.ACTIVE,
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
        if (!event.providerSubscriptionId)
            return;
        if (event.type === 'subscription.renewed') {
            await this.prisma.vendorSubscription.updateMany({
                where: { providerSubscriptionId: event.providerSubscriptionId },
                data: { status: client_1.SubscriptionStatus.ACTIVE, currentPeriodEnd: addMonths(now, 1) },
            });
            return;
        }
        if (event.type === 'subscription.payment_failed') {
            await this.prisma.vendorSubscription.updateMany({
                where: { providerSubscriptionId: event.providerSubscriptionId },
                data: { status: client_1.SubscriptionStatus.PAST_DUE },
            });
            return;
        }
        if (event.type === 'subscription.cancelled') {
            const sub = await this.prisma.vendorSubscription.findFirst({
                where: { providerSubscriptionId: event.providerSubscriptionId },
                select: { id: true, vendorId: true },
            });
            if (!sub)
                return;
            await this.prisma.$transaction([
                this.prisma.vendorSubscription.update({
                    where: { id: sub.id },
                    data: { status: client_1.SubscriptionStatus.EXPIRED, cancelledAt: now },
                }),
                this.prisma.vendorProfile.update({
                    where: { id: sub.vendorId },
                    data: { subscriptionTier: client_1.SubscriptionTier.BASIC },
                }),
            ]);
        }
    }
    async requireVendor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found — onboard first');
        return vendor;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(payment_provider_interface_1.PAYMENT_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map