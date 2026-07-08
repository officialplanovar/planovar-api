import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateListingDto {
  // NOTE: no vendorId here — the vendor is always resolved from the session
  // user server-side. Accepting it from the client allowed cross-vendor writes.

  @ApiProperty({ type: 'string', description: 'Category UUID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: 'string', description: 'Listing title', example: 'Premium Wedding Photography' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ type: 'string', description: 'Full listing description' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: PricingType, enumName: 'PricingType', description: 'FIXED | QUOTE | STARTING_FROM' })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiPropertyOptional({ type: 'number', description: 'Base price (required for FIXED / STARTING_FROM)', example: 250000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Service location: { city, state, country, address? }',
    example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  })
  @IsOptional()
  location?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String], description: 'Searchable tags', example: ['outdoor', 'traditional'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: 'boolean', description: 'Whether this listing can be rented by the day' })
  @IsOptional()
  @IsBoolean()
  isRentable?: boolean;

  @ApiPropertyOptional({ type: 'number', description: 'Per-day rental rate', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perDayRate?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Deposit amount for rentals', example: 20000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Image URLs (uploaded via /upload/listing/image), in display order',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ type: 'string', description: 'Product SKU', example: 'CAT-PHO-42381' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  sku?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Units in stock (products)', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Service duration value', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationValue?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Service duration unit', example: 'Hours' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  durationUnit?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Cancellation policy: Flexible | Moderate | Strict', example: 'Moderate' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cancellationPolicy?: string;
}
