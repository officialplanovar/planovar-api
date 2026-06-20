import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Vendor profile UUID' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ type: 'string', format: 'uuid', description: 'Listing UUID' })
  @IsUUID()
  listingId: string;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'Package UUID' })
  @IsUUID()
  @IsOptional()
  packageId?: string;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', description: 'Event UUID to associate with' })
  @IsUUID()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ type: 'string', example: '2026-11-15T00:00:00.000Z' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ type: 'string', example: 'Eko Hotel, Lagos' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Additional requirements or notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: 'number', example: 350000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;
}
