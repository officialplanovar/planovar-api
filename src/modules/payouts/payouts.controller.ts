import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TransactionsEnabledGuard } from '../../common/guards/transactions-enabled.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PayoutsService } from './payouts.service';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';

// Subscription-only mode (4 June MoM): vendor payouts are part of the disabled
// transactional surface. The whole controller 404s unless TRANSACTIONS_ENABLED=true.
@ApiTags('payouts')
@UseGuards(TransactionsEnabledGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(@Inject(PayoutsService) private readonly payoutsService: PayoutsService) {}

  // ─── Vendor routes ─────────────────────────────────────────────────────────

  @Get()
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the authenticated vendor's payouts" })
  listForVendor(@Req() req: Request) {
    return this.payoutsService.listForVendor((req as any).user.id);
  }

  @Get(':id')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single payout with line items' })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  getOne(@Req() req: Request, @Param('id') id: string) {
    return this.payoutsService.getOne(id, (req as any).user.id);
  }

  @Post('bank-details')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vendor bank account for payouts' })
  updateBankDetails(@Req() req: Request, @Body() dto: UpdateBankDetailsDto) {
    return this.payoutsService.updateBankDetails((req as any).user.id, dto);
  }

  // ─── Admin routes ──────────────────────────────────────────────────────────

  @Get('admin/pending')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all pending payouts' })
  listPending() {
    return this.payoutsService.listPending();
  }

  @Post('admin/:id/process')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: trigger payout processing via Paystack' })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  processPayout(@Param('id') id: string) {
    return this.payoutsService.processPayout(id);
  }
}
