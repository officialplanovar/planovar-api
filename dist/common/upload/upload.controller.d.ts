import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadAvatar(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadVendorCover(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadPortfolio(files: Express.Multer.File[]): Promise<UploadResponseDto[]>;
    uploadListingImage(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadListingImages(files: Express.Multer.File[]): Promise<UploadResponseDto[]>;
    uploadVoiceNote(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadAttachment(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadEventCover(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadVendorLogo(file: Express.Multer.File): Promise<UploadResponseDto>;
    uploadCategoryImage(file: Express.Multer.File): Promise<UploadResponseDto>;
    private assertFile;
}
