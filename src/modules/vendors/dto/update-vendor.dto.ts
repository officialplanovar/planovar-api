import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { VendorBusinessType, VendorType } from '@prisma/client';

export class UpdateVendorDto {
  @ApiPropertyOptional({ type: 'string', example: 'Lagos Lights Photography' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'lagos-lights-photography',
    description: 'URL-safe slug — lowercase letters, numbers, and hyphens only',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(60)
  slug?: string;

  @ApiPropertyOptional({ enum: VendorBusinessType })
  @IsEnum(VendorBusinessType)
  @IsOptional()
  businessType?: VendorBusinessType;

  @ApiPropertyOptional({ enum: VendorType })
  @IsEnum(VendorType)
  @IsOptional()
  vendorType?: VendorType;

  @ApiPropertyOptional({ type: 'string', example: 'Professional wedding and event photographer.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ type: 'string', example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: 'string', example: 'hello@lagoslights.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
    description: 'Vendor base location: city, state, country, lat/lng',
  })
  @IsOptional()
  location?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'number', example: 30, description: 'Service radius in km' })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  serviceRadiusKm?: number;

  @ApiPropertyOptional({ type: [String], example: ['wedding', 'portrait'] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: 'string', description: 'Logo image URL' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Cover image URL' })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ type: [String], description: 'Portfolio image URLs' })
  @IsOptional()
  portfolioUrls?: string[];
}
