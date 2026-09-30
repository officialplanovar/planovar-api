import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';

/**
 * Cloudflare R2 storage provider.
 * R2 is S3-compatible — uses the AWS SDK targeting the R2 endpoint.
 * Activated when UPLOAD_PROVIDER=r2 in .env.
 * All public IDs are the full S3 object key (e.g. planovar/listings/uuid.jpg).
 */
@Injectable()
export class R2Provider implements IStorageProvider {
  private readonly logger = new Logger(R2Provider.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    const accountId = config.getOrThrow('R2_ACCOUNT_ID');
    this.bucket = config.getOrThrow('R2_BUCKET_NAME');
    this.publicUrl = config.getOrThrow('R2_PUBLIC_URL');

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const ext = extname(fileName) || '';
    const key = `${options.folder}/${randomUUID()}${ext}`;

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // Store original name as metadata
        Metadata: { 'original-filename': encodeURIComponent(fileName) },
      },
    });

    await upload.done();

    return {
      url: `${this.publicUrl}/${key}`,
      publicId: key,
      fileName,
      mimeType,
      size: buffer.length,
      provider: 'r2',
    };
  }

  async delete(publicId: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: publicId }),
      );
    } catch (err) {
      this.logger.warn(`R2 delete failed for ${publicId}`, err);
    }
  }

  async getSignedUrl(publicId: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: publicId,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
