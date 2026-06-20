import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetUserActiveDto {
  @ApiProperty({ description: 'true = reactivate, false = suspend' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Reason (recorded in the audit log)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
