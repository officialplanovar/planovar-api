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
 * Apple App Store / Google Play in-app-purchase adapter — STUB.
 *
 * Interface placeholder only: every method throws NotImplementedException. This
 * adapter is NOT wired into the live IAP flow and is selected as the active
 * billing provider only if `PAYMENT_PROVIDER=iap` (prod uses `stripe`; see
 * billing.module.ts). It reads no env vars.
 *
 * The REAL mobile IAP validation does not flow through this adapter — it lives in
 * `subscriptions/iap.service.ts`, which validates App Store purchases via the App
 * Store Server API and Google Play purchases via the Play Developer API, and
 * handles App Store Server Notifications / Google RTDN.
 *
 * NOTE: mobile-app subscriptions may be REQUIRED to use store IAP (15–30% fee).
 * Web subscriptions stay on card rails (Stripe/Paystack/PayPal). For IAP the
 * "checkoutUrl" concept doesn't apply — the client purchases via the native
 * store and the server validates the resulting receipt/token.
 *
 * Env read by the real validator (iap.service.ts), NOT by this stub:
 *   APPLE_IAP_ISSUER_ID, APPLE_IAP_KEY_ID, APPLE_IAP_PRIVATE_KEY,
 *   APPLE_IAP_BUNDLE_ID, APPLE_IAP_APP_APPLE_ID,
 *   GOOGLE_PLAY_PACKAGE_NAME, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.
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
