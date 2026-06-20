import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class SetPreferencesDto {
  @ApiProperty({
    description: 'Array of category UUIDs the client is interested in',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
