import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Booking UUID the dispute relates to' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ type: 'string', maxLength: 150, description: 'Short reason summary' })
  @IsString()
  @MaxLength(150)
  reason: string;

  @ApiProperty({ type: 'string', maxLength: 3000, description: 'Full dispute description' })
  @IsString()
  @MaxLength(3000)
  description: string;
}
