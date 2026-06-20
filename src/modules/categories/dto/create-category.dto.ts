import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ type: 'string', example: 'Photography' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', example: 'photography' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ type: 'string', example: 'Professional event photography services' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'string', example: 'https://cdn.planovar.ng/icons/photography.svg' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ type: 'string', example: 'https://cdn.planovar.ng/images/photography.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: 'string', example: '#5B50F0', description: 'Hex accent colour' })
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'color must be a hex value like #5B50F0' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ type: [String], example: ['outdoor', 'luxury'], description: 'Editorial/browse tags' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(30)
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['photographer', 'photo', 'camera'],
    description: 'Search synonyms/aliases that should match this category',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ type: 'boolean', default: false, description: 'Surface in recommendations / home rails' })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ type: 'number', example: 0, description: 'Manual ranking boost (0 = neutral)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  popularityScore?: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Extensible metadata bag' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ type: 'boolean', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: 'string', description: 'Parent category UUID for subcategories' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
