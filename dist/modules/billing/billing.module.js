"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const payment_provider_interface_1 = require("./payment-provider.interface");
const stripe_adapter_1 = require("./adapters/stripe.adapter");
const paystack_adapter_1 = require("./adapters/paystack.adapter");
const paypal_adapter_1 = require("./adapters/paypal.adapter");
const store_iap_adapter_1 = require("./adapters/store-iap.adapter");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            stripe_adapter_1.StripeAdapter,
            paystack_adapter_1.PaystackAdapter,
            paypal_adapter_1.PaypalAdapter,
            store_iap_adapter_1.StoreIapAdapter,
            {
                provide: payment_provider_interface_1.PAYMENT_PROVIDER,
                inject: [
                    config_1.ConfigService,
                    stripe_adapter_1.StripeAdapter,
                    paystack_adapter_1.PaystackAdapter,
                    paypal_adapter_1.PaypalAdapter,
                    store_iap_adapter_1.StoreIapAdapter,
                ],
                useFactory: (config, stripe, paystack, paypal, iap) => {
                    const selected = String(config.get('PAYMENT_PROVIDER') ?? 'paystack').toLowerCase();
                    switch (selected) {
                        case 'stripe':
                            return stripe;
                        case 'paypal':
                            return paypal;
                        case 'iap':
                        case 'store':
                            return iap;
                        case 'paystack':
                            return paystack;
                        default:
                            throw new Error(`Unknown PAYMENT_PROVIDER "${selected}". Use stripe | paystack | paypal | iap.`);
                    }
                },
            },
        ],
        exports: [payment_provider_interface_1.PAYMENT_PROVIDER],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map