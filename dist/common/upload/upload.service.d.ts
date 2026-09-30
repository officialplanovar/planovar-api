import { ConfigService } from '@nestjs/config';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { R2Provider } from './providers/r2.provider';
import { LocalProvider } from './providers/local.provider';
import type { UploadResult } from './providers/storage-provider.interface';
export declare const UPLOAD_FOLDERS: {
    readonly AVATARS: "planovar/avatars";
    readonly VENDOR_COVERS: "planovar/vendors";
    readonly VENDOR_PORTFOLIO: "planovar/vendors/portfolio";
    readonly LISTINGS: "planovar/listings";
    readonly VOICE_NOTES: "planovar/voice_notes";
    readonly MESSAGE_ATTACHMENTS: "planovar/attachments";
    readonly EVENT_COVERS: "planovar/events";
    readonly CATEGORIES: "planovar/categories";
};
export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];
export declare class UploadService {
    private readonly config;
    private readonly cloudinary;
    private readonly r2;
    private readonly local;
    private readonly logger;
    private readonly provider;
    constructor(config: ConfigService, cloudinary: CloudinaryProvider, r2: R2Provider, local: LocalProvider);
    private hasCloudinaryCreds;
    uploadAvatar(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadVendorCover(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadPortfolioImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadListingImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadVoiceNote(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadMessageAttachment(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadEventCover(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadVendorLogo(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    uploadCategoryImage(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
    delete(publicId: string, resourceType?: string): Promise<void>;
    getSignedUrl(publicId: string, expiresIn?: number): Promise<string>;
    private validateFile;
}
