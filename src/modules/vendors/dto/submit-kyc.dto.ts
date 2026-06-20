import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

/**
 * Vendor KYC submission. The client uploads the documents first (via the upload
 * endpoints) and submits the resulting URLs here. NIN is required for all vendors;
 * CAC is required for LICENSED businesses (MoM #11–12).
 */
export class SubmitKycDto {
  @ApiProperty({ type: 'string', description: 'URL of the uploaded NIN slip (JPG/PNG/PDF)' })
  @IsUrl()
  ninDocumentUrl: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'URL of the uploaded CAC document (required for licensed businesses)',
  })
  @IsUrl()
  @IsOptional()
  cacDocumentUrl?: string;
}
