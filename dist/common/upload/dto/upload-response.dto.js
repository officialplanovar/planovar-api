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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UploadResponseDto {
    url;
    publicId;
    fileName;
    mimeType;
    size;
    width;
    height;
    duration;
    provider;
}
exports.UploadResponseDto = UploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/planovar/listings/abc.jpg' }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'planovar/listings/abc' }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "publicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'photo.jpg' }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'image/jpeg' }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 204800 }),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 1200, required: false }),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 800, required: false }),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 15.4, required: false, description: 'Duration in seconds — audio/video only' }),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'cloudinary', enum: ['cloudinary', 'r2'] }),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "provider", void 0);
//# sourceMappingURL=upload-response.dto.js.map