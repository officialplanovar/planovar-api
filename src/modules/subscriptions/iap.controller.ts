import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { IapVerifyDto } from './dto/iap-verify.dto';
import { IapService } from './iap.service';

/**
 * Apple/Google in-app-purchase endpoints for vendor subscriptions (mobile).
 * Mounted under the same `subscriptions` prefix as the web card-rail flow.
 */
@ApiTags('subscriptions')
@Controller('subscriptions')
export class IapController {
  constructor(@Inject(IapService) private readonly iap: IapService) {}

  // ─── Vendor: verify a store purchase and activate ──────────────────────────

  @Post('iap/verify')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Validate an Apple/Google in-app purchase and activate the vendor's subscription",
  })
  verify(@Req() req: Request, @Body() dto: IapVerifyDto) {
    return this.iap.verify((req as any).user.id, dto);
  }

  // ─── Store server notifications (no auth — verified by store signature) ─────

  @SkipThrottle()
  @Post('webhook/apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Apple App Store Server Notifications v2 receiver (signed JWS; no auth)',
  })
  async appleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: { signedPayload?: string },
  ) {
    // Apple POSTs `{ signedPayload: <JWS> }`. req.rawBody is available (main.ts
    // rawBody:true) for strict JWS signature verification once keys are wired.
    await this.iap.handleAppleNotification(body ?? {});
    return { received: true };
  }

  @SkipThrottle()
  @Post('webhook/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Google Play Real-Time Developer Notifications receiver (Pub/Sub push; no auth)',
  })
  async googleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: { message?: { data?: string }; token?: string },
    @Query('token') token?: string,
  ) {
    // Pub/Sub push: `{ message: { data: <base64 JSON> }, subscription }`.
    // A shared secret can be carried in the push URL query (`?token=…`) and
    // checked against GOOGLE_RTDN_VERIFICATION_TOKEN; forward it into the body.
    await this.iap.handleGoogleNotification({ ...(body ?? {}), token: token ?? body?.token });
    return { received: true };
  }
}
