import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ type: 'string', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ type: 'string', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ type: 'string', example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Country UUID from GET /locations/countries' })
  @IsUUID()
  @IsOptional()
  preferredCountryId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'City UUID from GET /locations/countries/:id/cities' })
  @IsUUID()
  @IsOptional()
  preferredCityId?: string;
}
