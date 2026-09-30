import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);
  private readonly configured: boolean;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
      this.configured = true;
      this.logger.log('Cloudinary configured');
    } else {
      this.configured = false;
      this.logger.warn(
        'Cloudinary credentials not set — file uploads will fail at runtime. ' +
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env',
      );
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<UploadResult> {
    if (!this.configured) {
      throw new InternalServerErrorException('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
    }
    // Map 'audio' hint to 'video' — Cloudinary classifies audio under the video resource type
    const rawType = options.resourceType ?? this.inferResourceType(mimeType);
    const resourceType: 'image' | 'video' | 'raw' | 'auto' =
      rawType === 'audio' ? 'video' : rawType;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: resourceType,
          // Image constraints
          ...(options.maxWidth || options.maxHeight
            ? {
                transformation: [
                  {
                    width: options.maxWidth,
                    height: options.maxHeight,
                    crop: 'limit', // never upscale
                  },
                ],
              }
            : {}),
          // Store original filename as a tag for searchability
          context: { original_filename: fileName },
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(new Error(error?.message ?? 'Cloudinary upload failed'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            fileName,
            mimeType,
            size: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
            provider: 'cloudinary',
          });
        },
      );

      // Pipe the buffer into the upload stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async delete(publicId: string, resourceType = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as 'image' | 'video' | 'raw',
      });
    } catch (err) {
      // Log but do not throw — a failed delete should not block other operations
      this.logger.warn(`Cloudinary delete failed for ${publicId}`, err);
    }
  }

  async getSignedUrl(publicId: string, expiresIn = 3600): Promise<string> {
    // Cloudinary signed URLs use the timestamp + signature approach
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      expires_at: expiration,
      secure: true,
    });
  }

  private inferResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'video'; // Cloudinary stores audio under the 'video' resource type
    return 'raw'; // PDFs, docs, etc.
  }
}
