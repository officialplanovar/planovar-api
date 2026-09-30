import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ enum: ConversationType, enumName: 'ConversationType' })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'Booking UUID — for DIRECT conversations' })
  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'Vendor profile UUID — for DIRECT without a booking' })
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'Event UUID — for GROUP conversations' })
  @IsUUID()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  groupName?: string;
}
