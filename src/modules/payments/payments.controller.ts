/**
 * PaymentsController
 *
 * NOTE: Webhook endpoints require raw body access.
 * main.ts must create the app with rawBody: true:
 *
 *   const app = await NestFactory.create(AppModule, { rawBody: true });
 *
 * This is already configured in main.ts.
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { TransactionsEnabledGuard } from '../../common/guards/transactions-enabled.guard';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  @Post('initiate')
  @UseGuards(SessionAuthGuard, TransactionsEnabledGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment for an installment (client only)' })
  initiatePayment(@Req() req: Request, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment((req as any).user.id, dto);
  }

  @Post('verify')
  @UseGuards(SessionAuthGuard, TransactionsEnabledGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a payment by reference' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Get('transactions')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history for the current user (paginated, default 20)' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Number of records (default 20)' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Offset (default 0)' })
  getTransactionHistory(
    @Req() req: Request,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.paymentsService.getTransactionHistory(
      (req as any).user.id,
      take ? parseInt(take, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get('installments/:bookingId')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all installments for a booking (client or vendor)' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  getInstallments(@Req() req: Request, @Param('bookingId') bookingId: string) {
    return this.paymentsService.getInstallmentsForBooking(bookingId, (req as any).user.id);
  }

  @Post('escrow/:holdId/release')
  @UseGuards(SessionAuthGuard, TransactionsEnabledGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release an escrow hold (client or admin only)' })
  @ApiParam({ name: 'holdId', description: 'EscrowHold UUID' })
  releaseEscrow(@Req() req: Request, @Param('holdId') holdId: string) {
    return this.paymentsService.releaseEscrow(holdId, (req as any).user.id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WEBHOOK ENDPOINTS — no auth guard, raw body required
  // ─────────────────────────────────────────────────────────────────────────

  @Post('webhook/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paystack webhook receiver (no auth — verified via HMAC-SHA512)',
  })
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) return { received: true };
    await this.paymentsService.handlePaystackWebhook(rawBody, signature ?? '');
    return { received: true };
  }

  @Post('webhook/flutterwave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Flutterwave webhook receiver (no auth — verified via secret hash header)',
  })
  async flutterwaveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('verif-hash') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) return { received: true };
    await this.paymentsService.handleFlutterwaveWebhook(rawBody, signature ?? '');
    return { received: true };
  }
}
