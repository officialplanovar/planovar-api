import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { R2Provider } from './providers/r2.provider';
import { LocalProvider } from './providers/local.provider';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Global() // UploadService available everywhere without re-importing
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // keep files in memory — provider streams to cloud
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB hard limit
        files: 20,                   // max 20 files per request
      },
    }),
  ],
  controllers: [UploadController],
  providers: [CloudinaryProvider, R2Provider, LocalProvider, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
