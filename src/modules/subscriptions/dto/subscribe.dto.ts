import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class SubscribeDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'UUID of the subscription plan to subscribe to',
  })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({
    enum: BillingCycle,
    description: 'Billing cycle (defaults to MONTHLY)',
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({
    type: 'string',
    description: 'URL to redirect to after the billing provider checkout completes',
    example: 'https://planovar.com/dashboard/subscription',
  })
  @IsUrl()
  @IsOptional()
  callbackUrl?: string;
}
