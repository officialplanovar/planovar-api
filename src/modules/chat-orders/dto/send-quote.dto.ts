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

  @ApiPropertyOptional({
    description:
      'Free-text payment terms the vendor writes (e.g. "50% on booking, balance on delivery"). Not enforced by the platform.',
  })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

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
