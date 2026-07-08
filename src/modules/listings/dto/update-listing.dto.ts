import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateListingDto {
  @ApiPropertyOptional({ type: 'string', description: 'Category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Listing title' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Full listing description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: PricingType, enumName: 'PricingType' })
  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;

  @ApiPropertyOptional({ type: 'number', description: 'Base price', example: 250000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Service location: { city, state, country, address? }',
  })
  @IsOptional()
  location?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'boolean', description: 'Whether the listing is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: 'boolean', description: 'Whether this listing is rentable' })
  @IsOptional()
  @IsBoolean()
  isRentable?: boolean;

  @ApiPropertyOptional({ type: 'number', description: 'Per-day rental rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perDayRate?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Deposit amount for rentals' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({ type: [String], description: 'Search tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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
