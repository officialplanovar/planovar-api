import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PostUpdateDto {
  @ApiProperty({ example: 'Out for delivery — arriving by 4pm' })
  @IsString()
  @MaxLength(500)
  message: string;
}

export class SubmitReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Fantastic service, highly recommend!' })
  @IsString()
  @MaxLength(2000)
  body: string;

  @ApiPropertyOptional({ example: 'Great experience' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
