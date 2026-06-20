"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../guards/session-auth.guard");
const upload_service_1 = require("./upload.service");
const upload_response_dto_1 = require("./dto/upload-response.dto");
let UploadController = class UploadController {
    uploadService;
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadAvatar(file) {
        this.assertFile(file);
        return this.uploadService.uploadAvatar(file.buffer, file.originalname, file.mimetype);
    }
    async uploadVendorCover(file) {
        this.assertFile(file);
        return this.uploadService.uploadVendorCover(file.buffer, file.originalname, file.mimetype);
    }
    async uploadPortfolio(files) {
        if (!files?.length)
            throw new common_1.BadRequestException('No files provided');
        return Promise.all(files.map((f) => this.uploadService.uploadPortfolioImage(f.buffer, f.originalname, f.mimetype)));
    }
    async uploadListingImage(file) {
        this.assertFile(file);
        return this.uploadService.uploadListingImage(file.buffer, file.originalname, file.mimetype);
    }
    async uploadListingImages(files) {
        if (!files?.length)
            throw new common_1.BadRequestException('No files provided');
        return Promise.all(files.map((f) => this.uploadService.uploadListingImage(f.buffer, f.originalname, f.mimetype)));
    }
    async uploadVoiceNote(file) {
        this.assertFile(file);
        return this.uploadService.uploadVoiceNote(file.buffer, file.originalname, file.mimetype);
    }
    async uploadAttachment(file) {
        this.assertFile(file);
        return this.uploadService.uploadMessageAttachment(file.buffer, file.originalname, file.mimetype);
    }
    async uploadEventCover(file) {
        this.assertFile(file);
        return this.uploadService.uploadEventCover(file.buffer, file.originalname, file.mimetype);
    }
    async uploadVendorLogo(file) {
        this.assertFile(file);
        return this.uploadService.uploadVendorLogo(file.buffer, file.originalname, file.mimetype);
    }
    async uploadCategoryImage(file) {
        this.assertFile(file);
        return this.uploadService.uploadCategoryImage(file.buffer, file.originalname, file.mimetype);
    }
    assertFile(file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a user avatar' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('vendor/cover'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a vendor cover image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadVendorCover", null);
__decorate([
    (0, common_1.Post)('vendor/portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload up to 10 portfolio images for a vendor' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: [upload_response_dto_1.UploadResponseDto] }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPortfolio", null);
__decorate([
    (0, common_1.Post)('listing/image'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a listing image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadListingImage", null);
__decorate([
    (0, common_1.Post)('listing/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload up to 20 listing images at once' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: [upload_response_dto_1.UploadResponseDto] }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadListingImages", null);
__decorate([
    (0, common_1.Post)('voice-note'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a voice note (audio file)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadVoiceNote", null);
__decorate([
    (0, common_1.Post)('attachment'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a message attachment (image or document)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAttachment", null);
__decorate([
    (0, common_1.Post)('event/cover'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an event cover image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadEventCover", null);
__decorate([
    (0, common_1.Post)('vendor/logo'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a vendor business logo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadVendorLogo", null);
__decorate([
    (0, common_1.Post)('category/image'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a category card image or icon' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 201, type: upload_response_dto_1.UploadResponseDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadCategoryImage", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('upload'),
    __param(0, (0, common_1.Inject)(upload_service_1.UploadService)),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map