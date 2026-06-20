import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ type: 'string', example: 'Adaeze & Chukwuemeka Wedding' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ type: 'string', example: 'A celebration of love and culture' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: 'string', example: '2026-11-15T00:00:00.000Z' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ type: 'string', example: 'Eko Hotel, Lagos' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ type: 'number', example: 5000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ type: 'number', example: 200 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ type: 'string', example: 'https://cdn.planovar.ng/covers/wedding.jpg' })
  @IsString()
  @IsOptional()
  coverUrl?: string;
}
