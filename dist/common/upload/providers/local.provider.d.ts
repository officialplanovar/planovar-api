import { ConfigService } from '@nestjs/config';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';
export declare class LocalProvider implements IStorageProvider {
    private readonly config;
    private readonly logger;
    private readonly publicDir;
    private readonly baseUrl;
    private static readonly EXT_BY_MIME;
    constructor(config: ConfigService);
    upload(buffer: Buffer, fileName: string, mimeType: string, options: UploadOptions): Promise<UploadResult>;
    delete(publicId: string): Promise<void>;
    getSignedUrl(publicId: string): Promise<string>;
}
