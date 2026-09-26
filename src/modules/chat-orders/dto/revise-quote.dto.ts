import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuoteLineItemDto } from './send-quote.dto';

/**
 * A revision of an existing active quote. clientId/listingId/eventId are
 * inherited from the parent quote — only the terms change.
 */
export class ReviseQuoteDto {
  @ApiProperty({ type: [QuoteLineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems: QuoteLineItemDto[];

  @ApiPropertyOptional({
    description:
      'Free-text payment terms the vendor writes. Not enforced by the platform.',
  })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional()
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
