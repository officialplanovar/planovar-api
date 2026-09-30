import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    @Inject(SubscriptionsService)
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // ─── Public ────────────────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List all available subscription plans (Basic/Premium/Gold, USD)' })
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  // ─── Vendor ────────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated vendor's active subscription" })
  getMySubscription(@Req() req: Request) {
    return this.subscriptionsService.getMySubscription((req as any).user.id);
  }

  @Post('subscribe')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Subscribe to a plan. Basic activates immediately; Premium/Gold require payment and return a checkout URL (activated on verify).',
  })
  subscribe(
    @Req() req: Request,
    @Body() dto: SubscribeDto,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.subscriptionsService.subscribe((req as any).user.id, dto, deviceId);
  }

  @Post('change')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Switch/upgrade to a different plan. Ends the current subscription and starts the chosen plan (Premium/Gold return a checkout URL).',
  })
  changePlan(
    @Req() req: Request,
    @Body() dto: SubscribeDto,
    @Headers('x-device-id') deviceId?: string,
  ) {
    return this.subscriptionsService.changePlan((req as any).user.id, dto, deviceId);
  }

  @Post('verify')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Verify a paid plan's payment by Paystack reference; activates the plan on success.",
  })
  verifyPayment(@Req() req: Request, @Body() dto: VerifyPaymentDto) {
    return this.subscriptionsService.verifyPayment((req as any).user.id, dto.reference);
  }

  @Post('cancel')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel the current subscription (stays active until the period ends).',
  })
  cancelSubscription(@Req() req: Request) {
    return this.subscriptionsService.cancelSubscription((req as any).user.id);
  }

  // ─── Webhook (billing provider → us; verified by signature, no auth) ────────

  @Post('billing/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Billing-provider webhook (Stripe, etc.) for the active PAYMENT_PROVIDER — signature-verified',
  })
  async billingWebhook(@Req() req: RawBodyRequest<Request>) {
    const rawBody = req.rawBody;
    if (!rawBody) return { received: true };
    return this.subscriptionsService.handleProviderWebhook(
      rawBody,
      req.headers as Record<string, string | undefined>,
    );
  }
}
