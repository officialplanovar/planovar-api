import { ApiPropertyOptional } from '@nestjs/swagger';
import { QuotePaymentStructure } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInstallmentDto, CreateQuoteLineItemDto } from './create-quote.dto';

export class UpdateQuoteDto {
  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'string', example: '2026-09-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ enum: QuotePaymentStructure, enumName: 'QuotePaymentStructure' })
  @IsEnum(QuotePaymentStructure)
  @IsOptional()
  paymentStructure?: QuotePaymentStructure;

  @ApiPropertyOptional({ type: 'number' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  escrowPercentage?: number;

  @ApiPropertyOptional({ type: 'number' })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({ type: [CreateQuoteLineItemDto], description: 'Replaces all existing line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteLineItemDto)
  @IsOptional()
  lineItems?: CreateQuoteLineItemDto[];

  @ApiPropertyOptional({ type: [CreateInstallmentDto], description: 'Replaces all existing installments' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @IsOptional()
  installments?: CreateInstallmentDto[];
}
