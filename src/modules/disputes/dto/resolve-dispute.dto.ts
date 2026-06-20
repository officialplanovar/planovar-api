import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ResolveDisputeDto {
  @ApiProperty({ type: 'string', maxLength: 3000, description: 'Resolution details' })
  @IsString()
  @MaxLength(3000)
  resolution: string;
}
