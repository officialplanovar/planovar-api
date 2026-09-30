import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  publicId?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ type: 'string', description: 'MIME type' })
  @IsString()
  fileType: string;

  @ApiProperty({ type: 'number', description: 'File size in bytes' })
  @IsInt()
  @Min(0)
  fileSize: number;
}

export class SendMessageDto {
  @ApiPropertyOptional({ type: 'string', description: 'Required for TEXT messages' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: MessageType, enumName: 'MessageType', default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType = MessageType.TEXT;

  @ApiPropertyOptional({ type: 'string' })
  @IsString()
  @IsOptional()
  voiceUrl?: string;

  @ApiPropertyOptional({ type: 'number', description: 'Voice duration in seconds' })
  @IsInt()
  @Min(0)
  @IsOptional()
  voiceDuration?: number;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'For QUOTE message types' })
  @IsUUID()
  @IsOptional()
  quoteId?: string;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];
}
