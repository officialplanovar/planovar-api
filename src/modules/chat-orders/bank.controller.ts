import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { PaystackDirectPayService } from './paystack-directpay.service';
import { ResolveAccountDto, SaveBankAccountDto } from './dto/bank-account.dto';

const uid = (req: Request) => (req as any).user.id as string;

@ApiTags('Vendor Bank')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('vendor-bank')
export class BankController {
  constructor(
    @Inject(PaystackDirectPayService)
    private readonly paystack: PaystackDirectPayService,
  ) {}

  @Get('banks')
  @ApiOperation({ summary: 'List Nigerian banks (for the account picker)' })
  banks() {
    return this.paystack.listBanks();
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Verify an account number → registered account name' })
  resolve(@Body() dto: ResolveAccountDto) {
    return this.paystack.resolveAccount(dto.bankCode, dto.accountNumber);
  }

  @Get()
  @ApiOperation({ summary: "The vendor's saved bank account (null if none)" })
  getMine(@Req() req: Request) {
    return this.paystack.getVendorBankAccount(uid(req));
  }

  @Post()
  @ApiOperation({ summary: 'Save bank account + create the direct-pay subaccount' })
  save(@Req() req: Request, @Body() dto: SaveBankAccountDto) {
    return this.paystack.saveVendorBankAccount(uid(req), dto);
  }
}
