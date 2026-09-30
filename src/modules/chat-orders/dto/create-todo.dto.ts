import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: 'Event group conversation id', format: 'uuid' })
  @IsUUID()
  conversationId: string;

  @ApiProperty({ example: 'Confirm final headcount' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date + time (ISO)' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiProperty({
    type: [String],
    description: 'User ids to assign (must be chat members)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  assigneeIds: string[];
}
