import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

export class CreateQuoteDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Booking UUID' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ type: 'number', example: 500000, description: 'Total quote amount' })
  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @ApiPropertyOptional({
    type: 'string',
    description:
      'Free-text payment terms (vendor-written, not enforced by the platform). Payment happens off-platform.',
  })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

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
}
