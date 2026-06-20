import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SearchListingsDto {
  @ApiPropertyOptional({ type: 'string', description: 'Full-text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Results per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perPage?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by category UUID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by pricing type: FIXED | QUOTE | STARTING_FROM' })
  @IsOptional()
  @IsString()
  pricingType?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by vendor subscription tier: BASIC | PREMIUM | GOLD' })
  @IsOptional()
  @IsString()
  vendorTier?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ type: 'boolean', description: 'Filter by rentable listings only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRentable?: boolean;
}

export class SearchVendorsDto {
  @ApiPropertyOptional({ type: 'string', description: 'Full-text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: 'number', description: 'Results per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perPage?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by subscription tier: BASIC | PREMIUM | GOLD' })
  @IsOptional()
  @IsString()
  subscriptionTier?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ type: 'boolean', description: 'Filter by verified vendors only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;
}

export class SearchEventsDto {
  @ApiPropertyOptional({ type: 'string', description: 'Full-text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;
}
