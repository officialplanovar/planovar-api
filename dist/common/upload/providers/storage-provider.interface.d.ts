export interface UploadResult {
    url: string;
    publicId: string;
    fileName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
    provider: 'cloudinary' | 'r2' | 'local';
}
export interface UploadOptions {
    folder: string;
    allowedMimeTypes?: string[];
    maxSizeBytes?: number;
    maxWidth?: number;
    maxHeight?: number;
    resourceType?: 'image' | 'video' | 'audio' | 'raw' | 'auto';
}
export interface IStorageProvider {
    upload(buffer: Buffer, fileName: string, mimeType: string, options: UploadOptions): Promise<UploadResult>;
    delete(publicId: string, resourceType?: string): Promise<void>;
    getSignedUrl(publicId: string, expiresIn?: number): Promise<string>;
}
