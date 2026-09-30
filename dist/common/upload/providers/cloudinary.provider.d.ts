import { ConfigService } from '@nestjs/config';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';
export declare class CloudinaryProvider implements IStorageProvider {
    private readonly config;
    private readonly logger;
    private readonly configured;
    constructor(config: ConfigService);
    upload(buffer: Buffer, fileName: string, mimeType: string, options: UploadOptions): Promise<UploadResult>;
    delete(publicId: string, resourceType?: string): Promise<void>;
    getSignedUrl(publicId: string, expiresIn?: number): Promise<string>;
    private inferResourceType;
}
