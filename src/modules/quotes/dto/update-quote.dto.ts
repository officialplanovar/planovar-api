import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuoteLineItemDto } from './create-quote.dto';

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

  @ApiPropertyOptional({
    type: 'string',
    description: 'Free-text payment terms (vendor-written, not enforced).',
  })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

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
}
