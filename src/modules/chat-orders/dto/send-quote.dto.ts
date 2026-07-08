import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class QuoteLineItemDto {
  @ApiProperty({ example: 'Man power' })
  @IsString()
  label: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class QuotePaymentTermDto {
  @ApiProperty({ example: 'On Confirmation' })
  @IsString()
  label: string;

  @ApiProperty({ example: 50, description: '% of the total (all terms sum to 100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiPropertyOptional({ example: 'Due on confirmation' })
  @IsOptional()
  @IsString()
  dueLabel?: string;

  @ApiPropertyOptional({ example: '2026-03-07T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class SendQuoteDto {
  @ApiProperty({ description: 'Client user id (recipient)' })
  @IsString()
  clientId: string;

  @ApiProperty({ description: 'Listing the quote is for', format: 'uuid' })
  @IsUUID()
  listingId: string;

  @ApiPropertyOptional({ description: 'Event this belongs to', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiProperty({ type: [QuoteLineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems: QuoteLineItemDto[];

  @ApiPropertyOptional({ type: [QuotePaymentTermDto], description: 'Milestone terms; omit for pay-at-once' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotePaymentTermDto)
  paymentTerms?: QuotePaymentTermDto[];

  @ApiPropertyOptional({ example: 7, description: 'Days the quote stays valid (default 7)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  validForDays?: number;

  @ApiPropertyOptional({ description: 'Explicit expiry (overrides validForDays)' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
