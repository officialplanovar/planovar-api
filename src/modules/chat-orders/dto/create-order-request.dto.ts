import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryMethod, FulfilmentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/** Direct product / rental order (no quote). */
export class CreateOrderRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  listingId: string;

  @ApiProperty({ enum: [FulfilmentType.PURCHASE, FulfilmentType.RENTAL] })
  @IsEnum(FulfilmentType)
  fulfilmentType: FulfilmentType;

  @ApiProperty({ enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiProperty({ example: 100000, description: 'Item / rental price' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Rental pickup date/time (ISO)' })
  @IsOptional()
  @IsDateString()
  pickupAt?: string;

  @ApiPropertyOptional({ description: 'Rental return date/time (ISO)' })
  @IsOptional()
  @IsDateString()
  returnAt?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Delivery address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
