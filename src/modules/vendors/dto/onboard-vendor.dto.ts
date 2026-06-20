import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class OnboardVendorDto {
  @ApiProperty({ type: 'string', example: 'Lagos Lights Photography' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  businessName: string;

  @ApiProperty({
    type: 'string',
    example: 'lagos-lights-photography',
    description: 'URL-safe slug — lowercase letters, numbers, and hyphens only',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({
    enum: VendorBusinessType,
    description: 'Licensed business or freelancer',
    example: VendorBusinessType.LICENSED,
  })
  @IsEnum(VendorBusinessType)
  @IsOptional()
  businessType?: VendorBusinessType;

  @ApiPropertyOptional({
    enum: VendorType,
    description: 'What the vendor offers (defaults to BOTH)',
    example: VendorType.BOTH,
  })
  @IsEnum(VendorType)
  @IsOptional()
  vendorType?: VendorType;

  @ApiPropertyOptional({ type: 'string', example: 'Professional wedding and event photographer based in Lagos.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Logo image URL', example: 'https://cdn.planovar.com/logos/abc.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Cover image URL' })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

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
    example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria', lat: 6.45, lng: 3.39 },
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

  @ApiPropertyOptional({
    type: [String],
    example: ['wedding', 'portrait', 'event'],
    description: 'Searchable category tags (min 3 recommended)',
  })
  @IsOptional()
  tags?: string[];
}
