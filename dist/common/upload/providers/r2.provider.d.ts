import { ConfigService } from '@nestjs/config';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';
export declare class R2Provider implements IStorageProvider {
    private readonly config;
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicUrl;
    constructor(config: ConfigService);
    upload(buffer: Buffer, fileName: string, mimeType: string, options: UploadOptions): Promise<UploadResult>;
    delete(publicId: string): Promise<void>;
    getSignedUrl(publicId: string, expiresIn?: number): Promise<string>;
}
