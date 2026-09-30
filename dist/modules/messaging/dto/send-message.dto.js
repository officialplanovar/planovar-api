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
exports.SendMessageDto = exports.AttachmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AttachmentDto {
    url;
    publicId;
    fileName;
    fileType;
    fileSize;
}
exports.AttachmentDto = AttachmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "publicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'MIME type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', description: 'File size in bytes' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AttachmentDto.prototype, "fileSize", void 0);
class SendMessageDto {
    content;
    type = client_1.MessageType.TEXT;
    voiceUrl;
    voiceDuration;
    quoteId;
    attachments;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Required for TEXT messages' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MessageType, enumName: 'MessageType', default: client_1.MessageType.TEXT }),
    (0, class_validator_1.IsEnum)(client_1.MessageType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "voiceUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Voice duration in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SendMessageDto.prototype, "voiceDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', format: 'uuid', description: 'For QUOTE message types' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "quoteId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [AttachmentDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttachmentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SendMessageDto.prototype, "attachments", void 0);
//# sourceMappingURL=send-message.dto.js.map