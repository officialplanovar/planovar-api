import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export enum KycDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

/** Admin decision on a vendor's submitted KYC. */
export class ReviewKycDto {
  @ApiProperty({ enum: KycDecision, example: KycDecision.APPROVE })
  @IsEnum(KycDecision)
  decision: KycDecision;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Reason for rejection (required when decision = REJECT)',
  })
  @ValidateIf((o) => o.decision === KycDecision.REJECT)
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
