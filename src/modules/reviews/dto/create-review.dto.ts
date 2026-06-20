import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Booking UUID to review' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ type: 'string', maxLength: 120, description: 'Short review title' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  title?: string;

  @ApiProperty({ type: 'string', maxLength: 2000, description: 'Review body' })
  @IsString()
  @MaxLength(2000)
  body: string;
}
