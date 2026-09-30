import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/planovar/listings/abc.jpg' })
  url: string;

  @ApiProperty({ type: 'string', example: 'planovar/listings/abc' })
  publicId: string;

  @ApiProperty({ type: 'string', example: 'photo.jpg' })
  fileName: string;

  @ApiProperty({ type: 'string', example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ type: 'number', example: 204800 })
  size: number;

  @ApiProperty({ type: 'number', example: 1200, required: false })
  width?: number;

  @ApiProperty({ type: 'number', example: 800, required: false })
  height?: number;

  @ApiProperty({ type: 'number', example: 15.4, required: false, description: 'Duration in seconds — audio/video only' })
  duration?: number;

  @ApiProperty({ type: 'string', example: 'cloudinary', enum: ['cloudinary', 'r2'] })
  provider: string;
}
