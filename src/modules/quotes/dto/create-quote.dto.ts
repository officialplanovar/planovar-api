import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstallmentType, QuotePaymentStructure } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteLineItemDto {
  @ApiProperty({ type: 'string', example: 'Photography — full day coverage' })
  @IsString()
  label: string;

  @ApiProperty({ type: 'number', example: 250000, description: 'Line item amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateInstallmentDto {
  @ApiProperty({ type: 'string', example: 'Initial deposit — 50%' })
  @IsString()
  label: string;

  @ApiProperty({ enum: InstallmentType, enumName: 'InstallmentType' })
  @IsEnum(InstallmentType)
  type: InstallmentType;

  @ApiProperty({ type: 'number', example: 50, description: 'Percentage of total (0–100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ type: 'string', example: '2026-10-01T00:00:00.000Z', description: 'Due date (ISO)' })
  @IsDateString()
  dueAt: string;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateQuoteDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Booking UUID' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ enum: QuotePaymentStructure, enumName: 'QuotePaymentStructure' })
  @IsEnum(QuotePaymentStructure)
  paymentStructure: QuotePaymentStructure;

  @ApiProperty({ type: 'number', example: 500000, description: 'Total quote amount' })
  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @ApiPropertyOptional({ type: 'number', example: 30, description: 'Escrow % (required for CUSTOM_ESCROW)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  escrowPercentage?: number;

  @ApiProperty({ type: 'string', example: '2026-09-01T00:00:00.000Z', description: 'Quote valid until date' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateQuoteLineItemDto], description: 'At least one line item required' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteLineItemDto)
  lineItems: CreateQuoteLineItemDto[];

  @ApiPropertyOptional({ type: [CreateInstallmentDto], description: 'Required for INSTALLMENTS or CUSTOM_ESCROW' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentDto)
  @IsOptional()
  installments?: CreateInstallmentDto[];
}
