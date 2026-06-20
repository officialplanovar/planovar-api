import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDER, PaymentProvider } from './payment-provider.interface';
import { StripeAdapter } from './adapters/stripe.adapter';
import { PaystackAdapter } from './adapters/paystack.adapter';
import { PaypalAdapter } from './adapters/paypal.adapter';
import { StoreIapAdapter } from './adapters/store-iap.adapter';

/**
 * Provider-agnostic billing module.
 *
 * Exposes the active subscription provider under the `PAYMENT_PROVIDER` token,
 * chosen at boot from `PAYMENT_PROVIDER` env (default: paystack). Inject with:
 *
 *   constructor(@Inject(PAYMENT_PROVIDER) private readonly billing: PaymentProvider) {}
 *
 * Global so any feature module (Phase 1 subscriptions) can inject it without re-importing.
 */
@Global()
@Module({
  providers: [
    StripeAdapter,
    PaystackAdapter,
    PaypalAdapter,
    StoreIapAdapter,
    {
      provide: PAYMENT_PROVIDER,
      inject: [
        ConfigService,
        StripeAdapter,
        PaystackAdapter,
        PaypalAdapter,
        StoreIapAdapter,
      ],
      useFactory: (
        config: ConfigService,
        stripe: StripeAdapter,
        paystack: PaystackAdapter,
        paypal: PaypalAdapter,
        iap: StoreIapAdapter,
      ): PaymentProvider => {
        const selected = String(
          config.get('PAYMENT_PROVIDER') ?? 'paystack',
        ).toLowerCase();
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
            throw new Error(
              `Unknown PAYMENT_PROVIDER "${selected}". Use stripe | paystack | paypal | iap.`,
            );
        }
      },
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class BillingModule {}
