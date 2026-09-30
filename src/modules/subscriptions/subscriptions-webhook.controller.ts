import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Constant-time comparison of two hex/ascii signatures. Guards against timing
 * attacks on webhook signature verification and never throws on length mismatch.
 */
function safeSignatureEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Paystack subscription lifecycle events we act on. Everything else (e.g. the
// former direct-pay `charge.success` / `PM_` milestone charges, which no longer
// exist) is ignored — the platform now only bills vendors for subscriptions.
const SUBSCRIPTION_EVENTS = new Set([
  'subscription.create',
  'invoice.update',
  'invoice.payment_failed',
  'subscription.disable',
  'subscription.not_renew',
]);

/**
 * Receives Paystack webhooks for vendor→Planovar subscription billing.
 *
 * Kept at the SAME path the Paystack dashboard is already configured with
 * (`POST /payments/webhook/paystack`) so relocating it out of the deleted
 * PaymentsModule requires no dashboard change. Verifies the raw body with
 * HMAC-SHA512 (requires `rawBody: true` in main.ts) then routes subscription
 * lifecycle events to SubscriptionsService.
 */
@ApiTags('subscriptions')
@Controller('payments')
export class SubscriptionsWebhookController {
  private readonly logger = new Logger(SubscriptionsWebhookController.name);

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SubscriptionsService)
    private readonly subscriptions: SubscriptionsService,
  ) {}

  @SkipThrottle()
  @Post('webhook/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Paystack webhook receiver for subscription billing (no auth — verified via HMAC-SHA512)',
  })
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) return { received: true };

    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY', '');
    const expectedSig = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (!safeSignatureEqual(expectedSig, signature ?? '')) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }

    let event: { event: string; data: Record<string, unknown> };
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      this.logger.error('Failed to parse Paystack webhook body', err);
      return { received: true };
    }

    if (SUBSCRIPTION_EVENTS.has(event.event)) {
      await this.subscriptions.handleSubscriptionWebhook(event as any);
    }

    return { received: true };
  }
}
