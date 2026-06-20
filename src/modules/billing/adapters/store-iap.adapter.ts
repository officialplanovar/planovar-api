import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  WebhookInput,
} from '../payment-provider.interface';

/**
 * Apple App Store / Google Play in-app-purchase adapter.
 * STUB (Phase 0): interface only. Implement server-side receipt validation +
 * App Store Server Notifications / Google RTDN in Phase 1.
 *
 * NOTE: mobile-app subscriptions may be REQUIRED to use store IAP (15–30% fee).
 * Web subscriptions stay on card rails (Stripe/Paystack/PayPal). For IAP the
 * "checkoutUrl" concept doesn't apply — the client purchases via the native
 * store and the server validates the resulting receipt/token.
 * Env: APPLE_IAP_SHARED_SECRET, APPLE_ISSUER_ID, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.
 */
@Injectable()
export class StoreIapAdapter implements PaymentProvider {
  readonly name = 'iap';
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  createSubscription(
    _input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    throw new NotImplementedException('StoreIapAdapter.createSubscription (Phase 1)');
  }

  cancelSubscription(_input: CancelSubscriptionInput): Promise<void> {
    throw new NotImplementedException('StoreIapAdapter.cancelSubscription (Phase 1)');
  }

  verifyAndParseWebhook(_input: WebhookInput): Promise<NormalizedWebhookEvent> {
    throw new NotImplementedException('StoreIapAdapter.verifyAndParseWebhook (Phase 1)');
  }
}
