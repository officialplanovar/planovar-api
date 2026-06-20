import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ReviewResponseDto {
  @ApiProperty({ type: 'string', maxLength: 2000, description: 'Vendor response body' })
  @IsString()
  @MaxLength(2000)
  body: string;
}
