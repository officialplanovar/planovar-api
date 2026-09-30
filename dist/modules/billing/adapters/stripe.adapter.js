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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeAdapter = StripeAdapter_1 = class StripeAdapter {
    config;
    name = 'stripe';
    logger = new common_1.Logger(StripeAdapter_1.name);
    _stripe = null;
    constructor(config) {
        this.config = config;
    }
    get stripe() {
        if (!this._stripe) {
            const key = this.config.get('STRIPE_SECRET_KEY');
            if (!key) {
                throw new common_1.InternalServerErrorException('STRIPE_SECRET_KEY is not configured');
            }
            this._stripe = new stripe_1.default(key);
        }
        return this._stripe;
    }
    async createSubscription(input) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: 'subscription',
                customer_email: input.email,
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency: input.currency.toLowerCase(),
                            unit_amount: input.amount,
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
                success_url: input.successUrl ?? 'https://planovar.com/dashboard/subscription?status=success',
                cancel_url: input.cancelUrl ?? 'https://planovar.com/dashboard/subscription?status=cancelled',
            });
            return {
                provider: this.name,
                checkoutUrl: session.url ?? undefined,
                providerSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
                providerCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
                status: 'pending',
                raw: session,
            };
        }
        catch (err) {
            this.logger.error('Stripe createSubscription failed', err);
            throw new common_1.BadRequestException('Failed to initialize Stripe subscription');
        }
    }
    async cancelSubscription(input) {
        if (!input.providerSubscriptionId)
            return;
        try {
            if (input.atPeriodEnd) {
                await this.stripe.subscriptions.update(input.providerSubscriptionId, {
                    cancel_at_period_end: true,
                });
            }
            else {
                await this.stripe.subscriptions.cancel(input.providerSubscriptionId);
            }
        }
        catch (err) {
            this.logger.warn(`Stripe cancel failed: ${err.message}`);
        }
    }
    async verifyAndParseWebhook(input) {
        const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
        const sig = input.headers['stripe-signature'];
        if (!secret || !sig) {
            throw new common_1.BadRequestException('Missing Stripe webhook signature/secret');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(input.rawBody, sig, secret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid Stripe webhook signature');
        }
        const map = {
            'checkout.session.completed': 'subscription.activated',
            'customer.subscription.created': 'subscription.activated',
            'invoice.paid': 'subscription.renewed',
            'customer.subscription.deleted': 'subscription.cancelled',
            'invoice.payment_failed': 'subscription.payment_failed',
        };
        const type = map[event.type] ?? 'unknown';
        const obj = event.data.object;
        const providerSubscriptionId = typeof obj.subscription === 'string' ? obj.subscription : obj.id;
        const vendorId = obj.metadata?.vendorId;
        return { type, providerSubscriptionId, vendorId, raw: event };
    }
    flattenMeta(meta) {
        if (!meta)
            return {};
        return Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)]));
    }
};
exports.StripeAdapter = StripeAdapter;
exports.StripeAdapter = StripeAdapter = StripeAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeAdapter);
//# sourceMappingURL=stripe.adapter.js.map