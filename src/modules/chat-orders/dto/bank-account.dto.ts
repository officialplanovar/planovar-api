import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ResolveAccountDto {
  @ApiProperty({ example: '058', description: 'Bank code' })
  @IsString()
  bankCode: string;

  @ApiProperty({ example: '0123456789', description: '10-digit NUBAN' })
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'accountNumber must be a 10-digit number' })
  accountNumber: string;
}

export class SaveBankAccountDto {
  @ApiProperty({ example: '058' })
  @IsString()
  bankCode: string;

  @ApiProperty({ example: 'GTBank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'accountNumber must be a 10-digit number' })
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  accountName: string;
}
