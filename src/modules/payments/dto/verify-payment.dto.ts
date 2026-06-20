import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    type: 'string',
    description: 'Paystack or Flutterwave transaction reference',
  })
  @IsString()
  reference: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['paystack', 'flutterwave'],
    description: 'Payment provider — defaults to paystack',
  })
  @IsEnum(['paystack', 'flutterwave'])
  @IsOptional()
  provider?: 'paystack' | 'flutterwave';
}
