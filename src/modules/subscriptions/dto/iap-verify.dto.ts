import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import type { IapPlatform } from '../iap/iap-products';

export class IapVerifyDto {
  @ApiProperty({
    enum: ['apple', 'google'],
    description: 'Store the purchase was made in',
  })
  @IsIn(['apple', 'google'])
  platform: IapPlatform;

  @ApiProperty({
    description:
      'Store product id (e.g. premium_monthly, gold_yearly) — must map to a Planovar tier/cycle',
    example: 'premium_monthly',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  productId: string;

  @ApiProperty({
    description:
      'Apple: the signed transaction JWS / transaction id from StoreKit. Google: the purchase token returned by Play Billing.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  purchaseToken: string;
}
