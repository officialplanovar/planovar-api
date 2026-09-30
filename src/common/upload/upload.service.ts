import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { R2Provider } from './providers/r2.provider';
import { LocalProvider } from './providers/local.provider';
import type { IStorageProvider, UploadOptions, UploadResult } from './providers/storage-provider.interface';

export const UPLOAD_FOLDERS = {
  AVATARS: 'planovar/avatars',
  VENDOR_COVERS: 'planovar/vendors',
  VENDOR_PORTFOLIO: 'planovar/vendors/portfolio',
  LISTINGS: 'planovar/listings',
  VOICE_NOTES: 'planovar/voice_notes',
  MESSAGE_ATTACHMENTS: 'planovar/attachments',
  EVENT_COVERS: 'planovar/events',
  CATEGORIES: 'planovar/categories',
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB default

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/m4a'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOC_TYPES   = ['application/pdf'];

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly provider: IStorageProvider;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(CloudinaryProvider) private readonly cloudinary: CloudinaryProvider,
    @Inject(R2Provider) private readonly r2: R2Provider,
    @Inject(LocalProvider) private readonly local: LocalProvider,
  ) {
    const providerName = config.get<string>('UPLOAD_PROVIDER', 'cloudinary');
    if (providerName === 'local') {
      this.provider = this.local;
    } else if (providerName === 'r2') {
      this.provider = this.r2;
    } else if (this.hasCloudinaryCreds()) {
      this.provider = this.cloudinary;
    } else {
      // Dev convenience: a cloud provider was selected but has no credentials.
      // Fall back to local filesystem storage so uploads still work end-to-end.
      this.logger.warn(
        `UPLOAD_PROVIDER=${providerName} has no credentials — falling back to local filesystem storage. ` +
          `Set the provider's keys, or UPLOAD_PROVIDER=local to silence this.`,
      );
      this.provider = this.local;
    }
    this.logger.log(`Upload provider: ${this.provider === this.local ? 'local' : providerName}`);
  }

  private hasCloudinaryCreds(): boolean {
    return Boolean(
      this.config.get<string>('CLOUDINARY_CLOUD_NAME') &&
        this.config.get<string>('CLOUDINARY_API_KEY') &&
        this.config.get<string>('CLOUDINARY_API_SECRET'),
    );
  }

  // ─── Typed upload helpers ────────────────────────────────────────────────

  async uploadAvatar(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.AVATARS,
      resourceType: 'image',
      maxWidth: 400,
      maxHeight: 400,
    });
  }

  async uploadVendorCover(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.VENDOR_COVERS,
      resourceType: 'image',
      maxWidth: 1200,
      maxHeight: 800,
    });
  }

  async uploadPortfolioImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.VENDOR_PORTFOLIO,
      resourceType: 'image',
      maxWidth: 1600,
      maxHeight: 1200,
    });
  }

  async uploadListingImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.LISTINGS,
      resourceType: 'image',
      maxWidth: 1600,
      maxHeight: 1200,
    });
  }

  async uploadVoiceNote(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_AUDIO_TYPES, 15 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.VOICE_NOTES,
      resourceType: 'audio',
    });
  }

  async uploadMessageAttachment(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<UploadResult> {
    // Chat attachments: images only for now (documents accepted later per spec)
    const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
    this.validateFile(buffer, mimeType, allowed, MAX_FILE_SIZE);

    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.MESSAGE_ATTACHMENTS,
      resourceType,
    });
  }

  async uploadEventCover(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.EVENT_COVERS,
      resourceType: 'image',
      maxWidth: 1200,
      maxHeight: 600,
    });
  }

  async uploadVendorLogo(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.VENDOR_COVERS,
      resourceType: 'image',
      maxWidth: 512,
      maxHeight: 512,
    });
  }

  async uploadCategoryImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 8 * 1024 * 1024);
    return this.provider.upload(buffer, fileName, mimeType, {
      folder: UPLOAD_FOLDERS.CATEGORIES,
      resourceType: 'image',
      maxWidth: 1200,
      maxHeight: 800,
    });
  }

  // ─── Generic delete ──────────────────────────────────────────────────────

  async delete(publicId: string, resourceType?: string): Promise<void> {
    return this.provider.delete(publicId, resourceType);
  }

  async getSignedUrl(publicId: string, expiresIn?: number): Promise<string> {
    return this.provider.getSignedUrl(publicId, expiresIn);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private validateFile(
    buffer: Buffer,
    mimeType: string,
    allowedTypes: string[],
    maxBytes: number,
  ): void {
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        `File type "${mimeType}" is not allowed. Accepted: ${allowedTypes.join(', ')}`,
      );
    }
    if (buffer.length > maxBytes) {
      const mb = (maxBytes / 1024 / 1024).toFixed(0);
      throw new BadRequestException(`File exceeds the maximum allowed size of ${mb} MB`);
    }
  }
}
