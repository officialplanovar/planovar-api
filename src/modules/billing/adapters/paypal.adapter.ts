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
 * PayPal adapter — wallet option (MoM #10).
 * STUB (Phase 0): interface only. Implement with PayPal Subscriptions API in Phase 1.
 * Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_PLAN_* .
 */
@Injectable()
export class PaypalAdapter implements PaymentProvider {
  readonly name = 'paypal';
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  createSubscription(
    _input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    throw new NotImplementedException('PaypalAdapter.createSubscription (Phase 1)');
  }

  cancelSubscription(_input: CancelSubscriptionInput): Promise<void> {
    throw new NotImplementedException('PaypalAdapter.cancelSubscription (Phase 1)');
  }

  verifyAndParseWebhook(_input: WebhookInput): Promise<NormalizedWebhookEvent> {
    throw new NotImplementedException('PaypalAdapter.verifyAndParseWebhook (Phase 1)');
  }
}
