import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * Vendor KYC/KYB submission (global, document-only — no biometric/face check).
 * The client uploads the documents first (via the upload endpoints) and submits
 * the resulting URLs here. A government photo ID is required for every vendor; a
 * business registration document is required for registered (LICENSED) businesses.
 */
export class SubmitKycDto {
  @ApiProperty({
    type: 'string',
    description: 'URL of the uploaded government photo ID (JPG/PNG/PDF)',
  })
  @IsUrl()
  idDocumentUrl: string;

  @ApiProperty({
    description: 'Type of government ID',
    enum: ['passport', 'national_id', 'drivers_license'],
  })
  @IsIn(['passport', 'national_id', 'drivers_license'])
  idType: string;

  @ApiProperty({ type: 'string', description: 'Country that issued the ID' })
  @IsString()
  idCountry: string;

  @ApiPropertyOptional({
    type: 'string',
    description:
      'URL of the uploaded business registration document (required for registered businesses)',
  })
  @IsUrl()
  @IsOptional()
  businessRegDocumentUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Country where the business is registered',
  })
  @IsString()
  @IsOptional()
  businessRegCountry?: string;
}
