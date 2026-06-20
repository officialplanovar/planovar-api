import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(@Inject(UploadService) private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload a user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadAvatar(file.buffer, file.originalname, file.mimetype);
  }

  @Post('vendor/cover')
  @ApiOperation({ summary: 'Upload a vendor cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVendorCover(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadVendorCover(file.buffer, file.originalname, file.mimetype);
  }

  @Post('vendor/portfolio')
  @ApiOperation({ summary: 'Upload up to 10 portfolio images for a vendor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @ApiResponse({ status: 201, type: [UploadResponseDto] })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto[]> {
    if (!files?.length) throw new BadRequestException('No files provided');
    return Promise.all(
      files.map((f) =>
        this.uploadService.uploadPortfolioImage(f.buffer, f.originalname, f.mimetype),
      ),
    );
  }

  @Post('listing/image')
  @ApiOperation({ summary: 'Upload a listing image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadListingImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadListingImage(file.buffer, file.originalname, file.mimetype);
  }

  @Post('listing/images')
  @ApiOperation({ summary: 'Upload up to 20 listing images at once' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @ApiResponse({ status: 201, type: [UploadResponseDto] })
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadListingImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto[]> {
    if (!files?.length) throw new BadRequestException('No files provided');
    return Promise.all(
      files.map((f) =>
        this.uploadService.uploadListingImage(f.buffer, f.originalname, f.mimetype),
      ),
    );
  }

  @Post('voice-note')
  @ApiOperation({ summary: 'Upload a voice note (audio file)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVoiceNote(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadVoiceNote(file.buffer, file.originalname, file.mimetype);
  }

  @Post('attachment')
  @ApiOperation({ summary: 'Upload a message attachment (image or document)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadMessageAttachment(file.buffer, file.originalname, file.mimetype);
  }

  @Post('event/cover')
  @ApiOperation({ summary: 'Upload an event cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEventCover(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadEventCover(file.buffer, file.originalname, file.mimetype);
  }

  @Post('vendor/logo')
  @ApiOperation({ summary: 'Upload a vendor business logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVendorLogo(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadVendorLogo(file.buffer, file.originalname, file.mimetype);
  }

  @Post('category/image')
  @ApiOperation({ summary: 'Upload a category card image or icon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.uploadService.uploadCategoryImage(file.buffer, file.originalname, file.mimetype);
  }

  private assertFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) throw new BadRequestException('No file provided');
  }
}
