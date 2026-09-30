export interface UploadResult {
  /** Public URL to access the file */
  url: string;
  /** Provider-specific ID used to delete/transform the file */
  publicId: string;
  /** Original filename */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Width in pixels — images/video only */
  width?: number;
  /** Height in pixels — images/video only */
  height?: number;
  /** Duration in seconds — audio/video only */
  duration?: number;
  /** Which storage backend stored this file */
  provider: 'cloudinary' | 'r2' | 'local';
}

export interface UploadOptions {
  /** Cloudinary folder / R2 key prefix  e.g. 'planovar/listings' */
  folder: string;
  /** Allowed MIME types. Undefined = accept all. */
  allowedMimeTypes?: string[];
  /** Max file size in bytes. Default: 50 MB */
  maxSizeBytes?: number;
  /** For images: resize to fit within these dimensions (Cloudinary only) */
  maxWidth?: number;
  maxHeight?: number;
  /** Resource type hint — helps Cloudinary classify the upload */
  resourceType?: 'image' | 'video' | 'audio' | 'raw' | 'auto';
}

export interface IStorageProvider {
  /**
   * Upload a file buffer to the storage backend.
   * @param buffer   Raw file data
   * @param fileName Original filename (used for content-type inference and R2 keys)
   * @param mimeType MIME type of the file
   * @param options  Folder and constraints
   */
  upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<UploadResult>;

  /**
   * Permanently delete a file from the storage backend.
   * @param publicId The publicId returned by upload()
   * @param resourceType Required by Cloudinary to locate the asset
   */
  delete(publicId: string, resourceType?: string): Promise<void>;

  /**
   * Generate a short-lived signed URL for private access.
   * R2: pre-signed GET URL. Cloudinary: signed delivery URL.
   * @param publicId  The publicId returned by upload()
   * @param expiresIn Seconds until expiry. Default: 3600 (1 hour)
   */
  getSignedUrl(publicId: string, expiresIn?: number): Promise<string>;
}
