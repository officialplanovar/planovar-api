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
var PaystackAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PaystackAdapter = PaystackAdapter_1 = class PaystackAdapter {
    config;
    name = 'paystack';
    base = 'https://api.paystack.co';
    logger = new common_1.Logger(PaystackAdapter_1.name);
    constructor(config) {
        this.config = config;
    }
    get secret() {
        return this.config.getOrThrow('PAYSTACK_SECRET_KEY');
    }
    headers() {
        return {
            Authorization: `Bearer ${this.secret}`,
            'Content-Type': 'application/json',
        };
    }
    async createSubscription(input) {
        const debug = process.env.NODE_ENV !== 'production';
        try {
            const requestBody = {
                email: input.email,
                amount: input.amount,
                currency: input.currency,
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
                this.logger.log(`→ Paystack initialize: ${JSON.stringify({
                    amount: requestBody.amount,
                    currency: requestBody.currency,
                    email: requestBody.email,
                    callback_url: requestBody.callback_url,
                    tier: input.tier,
                })}`);
            }
            const res = await fetch(`${this.base}/transaction/initialize`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify(requestBody),
            });
            const data = (await res.json().catch(() => null));
            if (debug) {
                this.logger.log(`← Paystack initialize (${res.status}): ${JSON.stringify({
                    status: data?.status,
                    message: data?.message,
                    reference: data?.data?.reference,
                    checkoutUrl: data?.data?.authorization_url,
                })}`);
            }
            if (!res.ok || !data?.status || !data?.data?.authorization_url) {
                const reason = data?.message ?? `HTTP ${res.status}`;
                this.logger.error(`Paystack initialize failed (${res.status}): ${JSON.stringify(data ?? {})}`);
                throw new common_1.ServiceUnavailableException(`Payment provider error: ${reason}. Check PAYSTACK_SECRET_KEY.`);
            }
            return {
                provider: this.name,
                checkoutUrl: data.data.authorization_url,
                providerSubscriptionId: data.data.reference,
                status: 'pending',
                raw: data.data,
            };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException ||
                err instanceof common_1.ServiceUnavailableException) {
                throw err;
            }
            this.logger.error(`Paystack initialize threw: ${err}`);
            throw new common_1.ServiceUnavailableException('Could not reach the payment provider. Please try again.');
        }
    }
    async verifyTransaction(reference) {
        try {
            const res = await fetch(`${this.base}/transaction/verify/${encodeURIComponent(reference)}`, { headers: this.headers() });
            const data = (await res.json().catch(() => null));
            const status = data?.data?.status;
            if (process.env.NODE_ENV !== 'production') {
                this.logger.log(`← Paystack verify ${reference} (${res.status}): status=${status} amount=${data?.data?.amount} currency=${data?.data?.currency}`);
            }
            if (status === 'success')
                return { status: 'success', raw: data.data };
            if (status === 'failed' || status === 'abandoned') {
                return { status: 'failed', raw: data?.data };
            }
            return { status: 'pending', raw: data?.data };
        }
        catch (err) {
            this.logger.error(`Paystack verify threw: ${err}`);
            return { status: 'pending' };
        }
    }
    async cancelSubscription(input) {
        if (!input.providerSubscriptionId)
            return;
        try {
            await fetch(`${this.base}/subscription/disable`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify({
                    code: input.providerSubscriptionId,
                    token: input.providerSubscriptionId,
                }),
            });
        }
        catch {
        }
    }
    verifyAndParseWebhook(_input) {
        return Promise.resolve({ type: 'unknown', raw: null });
    }
};
exports.PaystackAdapter = PaystackAdapter;
exports.PaystackAdapter = PaystackAdapter = PaystackAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaystackAdapter);
//# sourceMappingURL=paystack.adapter.js.map