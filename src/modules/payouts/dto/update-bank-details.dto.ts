import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class UpdateBankDetailsDto {
  @ApiProperty({
    type: 'string',
    description: 'Bank code (e.g. 058 for GTBank)',
    example: '058',
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    type: 'string',
    description: '10-digit NUBAN bank account number',
    example: '0123456789',
  })
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'bankAccount must be a 10-digit number' })
  bankAccount: string;

  @ApiProperty({
    type: 'string',
    description: 'Account name as verified by the bank',
    example: 'John Doe',
  })
  @IsString()
  accountName: string;
}
