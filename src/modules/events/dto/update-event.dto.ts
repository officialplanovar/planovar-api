import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'string', example: '2026-11-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ type: 'number' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ type: 'number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ enum: EventStatus, enumName: 'EventStatus' })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
