import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'UUID of the installment being paid',
  })
  @IsUUID()
  installmentId: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['paystack', 'flutterwave'],
    description: 'Payment provider — defaults to paystack',
  })
  @IsEnum(['paystack', 'flutterwave'])
  @IsOptional()
  provider?: 'paystack' | 'flutterwave';

  @ApiPropertyOptional({
    type: 'string',
    description: 'Redirect URL after Paystack payment completes',
  })
  @IsUrl()
  @IsOptional()
  callbackUrl?: string;
}
