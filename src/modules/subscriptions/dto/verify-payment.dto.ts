import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Paystack transaction reference (from the checkout callback)' })
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  reference: string;
}
