import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CallTokenDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Conversation to call within',
  })
  @IsUUID()
  conversationId: string;
}
