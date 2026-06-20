import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { extname, join } from 'path';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage-provider.interface';

/**
 * Filesystem storage for local development (no external account required).
 * Files are written under `public/uploads/<folder>/` and served by the static
 * middleware (main.ts `useStaticAssets('public')`) at `<API_BASE_URL>/uploads/...`.
 *
 * Activate with `UPLOAD_PROVIDER=local`. Not for production — use cloudinary/r2 there.
 */
@Injectable()
export class LocalProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalProvider.name);
  private readonly publicDir = join(process.cwd(), 'public');
  private readonly baseUrl: string;

  // MIME → extension fallback when the filename has none.
  private static readonly EXT_BY_MIME: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/heic': '.heic',
    'application/pdf': '.pdf',
  };

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.baseUrl = (config.get<string>('API_BASE_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
    this.logger.log('Local filesystem upload provider active (public/uploads)');
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const ext = extname(fileName) || LocalProvider.EXT_BY_MIME[mimeType] || '';
    // folder e.g. 'planovar/categories' → public/uploads/planovar/categories
    const relDir = join('uploads', options.folder);
    const absDir = join(this.publicDir, relDir);
    await mkdir(absDir, { recursive: true });

    const name = `${randomUUID()}${ext}`;
    const relPath = join(relDir, name); // e.g. uploads/planovar/categories/<uuid>.png
    await writeFile(join(this.publicDir, relPath), buffer);

    // Serve path uses forward slashes regardless of OS.
    const urlPath = relPath.split('\\').join('/');
    return {
      url: `${this.baseUrl}/${urlPath}`,
      publicId: urlPath,
      fileName,
      mimeType,
      size: buffer.length,
      provider: 'local',
    };
  }

  async delete(publicId: string): Promise<void> {
    try {
      await unlink(join(this.publicDir, publicId));
    } catch (err) {
      // Missing file is fine; log anything else but never throw.
      this.logger.warn(`Local delete skipped for ${publicId}: ${err}`);
    }
  }

  async getSignedUrl(publicId: string): Promise<string> {
    // Local files are public — no signing needed.
    return `${this.baseUrl}/${publicId}`;
  }
}
