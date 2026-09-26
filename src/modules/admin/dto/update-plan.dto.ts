import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Admin update of a subscription plan's pricing/config. All fields optional —
 * only the supplied ones are changed. `listingLimit` accepts `null` (Gold =
 * unlimited); `0` means no listings (Basic).
 */
export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Display name, e.g. "Premium"' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: 'Monthly price in the plan currency' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMonthly?: number;

  @ApiPropertyOptional({ description: 'Yearly price in the plan currency' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceYearly?: number;

  @ApiPropertyOptional({ description: 'ISO 4217 currency code, e.g. "USD"' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Max active listings; null = unlimited, 0 = none',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  listingLimit?: number | null;

  @ApiPropertyOptional({
    description: 'Feature bullet points',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
