import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(@Inject(QuotesService) private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Vendor creates a quote for a booking' })
  create(@Req() req: Request, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create((req as any).user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List quotes — auto-detects vendor or client role' })
  findAll(@Req() req: Request) {
    return this.quotesService.findAll((req as any).user.id, (req as any).user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote details with line items and installments' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.quotesService.findOne(id, (req as any).user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Vendor updates a draft (unlocked) quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, (req as any).user.id, dto);
  }

  // NOTE: no `:id/send` route — quotes are live (PENDING) from creation.
  // The old send endpoint mistakenly flipped quotes straight to ACCEPTED.

  @Post(':id/accept')
  @ApiOperation({
    summary:
      'Client accepts the quote — locks terms and CONFIRMS the booking inquiry (no payment step)',
  })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  accept(@Req() req: Request, @Param('id') id: string) {
    return this.quotesService.accept(id, (req as any).user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Client declines the quote (conversation stays open)' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  reject(@Req() req: Request, @Param('id') id: string) {
    return this.quotesService.reject(id, (req as any).user.id);
  }
}
