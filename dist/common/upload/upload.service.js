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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = exports.UPLOAD_FOLDERS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_provider_1 = require("./providers/cloudinary.provider");
const r2_provider_1 = require("./providers/r2.provider");
const local_provider_1 = require("./providers/local.provider");
exports.UPLOAD_FOLDERS = {
    AVATARS: 'planovar/avatars',
    VENDOR_COVERS: 'planovar/vendors',
    VENDOR_PORTFOLIO: 'planovar/vendors/portfolio',
    LISTINGS: 'planovar/listings',
    VOICE_NOTES: 'planovar/voice_notes',
    MESSAGE_ATTACHMENTS: 'planovar/attachments',
    EVENT_COVERS: 'planovar/events',
    CATEGORIES: 'planovar/categories',
};
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/m4a'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
let UploadService = UploadService_1 = class UploadService {
    config;
    cloudinary;
    r2;
    local;
    logger = new common_1.Logger(UploadService_1.name);
    provider;
    constructor(config, cloudinary, r2, local) {
        this.config = config;
        this.cloudinary = cloudinary;
        this.r2 = r2;
        this.local = local;
        const providerName = config.get('UPLOAD_PROVIDER', 'cloudinary');
        if (providerName === 'local') {
            this.provider = this.local;
        }
        else if (providerName === 'r2') {
            this.provider = this.r2;
        }
        else if (this.hasCloudinaryCreds()) {
            this.provider = this.cloudinary;
        }
        else {
            this.logger.warn(`UPLOAD_PROVIDER=${providerName} has no credentials — falling back to local filesystem storage. ` +
                `Set the provider's keys, or UPLOAD_PROVIDER=local to silence this.`);
            this.provider = this.local;
        }
        this.logger.log(`Upload provider: ${this.provider === this.local ? 'local' : providerName}`);
    }
    hasCloudinaryCreds() {
        return Boolean(this.config.get('CLOUDINARY_CLOUD_NAME') &&
            this.config.get('CLOUDINARY_API_KEY') &&
            this.config.get('CLOUDINARY_API_SECRET'));
    }
    async uploadAvatar(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.AVATARS,
            resourceType: 'image',
            maxWidth: 400,
            maxHeight: 400,
        });
    }
    async uploadVendorCover(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.VENDOR_COVERS,
            resourceType: 'image',
            maxWidth: 1200,
            maxHeight: 800,
        });
    }
    async uploadPortfolioImage(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.VENDOR_PORTFOLIO,
            resourceType: 'image',
            maxWidth: 1600,
            maxHeight: 1200,
        });
    }
    async uploadListingImage(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.LISTINGS,
            resourceType: 'image',
            maxWidth: 1600,
            maxHeight: 1200,
        });
    }
    async uploadVoiceNote(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_AUDIO_TYPES, 15 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.VOICE_NOTES,
            resourceType: 'audio',
        });
    }
    async uploadMessageAttachment(buffer, fileName, mimeType) {
        const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
        this.validateFile(buffer, mimeType, allowed, MAX_FILE_SIZE);
        const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.MESSAGE_ATTACHMENTS,
            resourceType,
        });
    }
    async uploadEventCover(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.EVENT_COVERS,
            resourceType: 'image',
            maxWidth: 1200,
            maxHeight: 600,
        });
    }
    async uploadVendorLogo(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.VENDOR_COVERS,
            resourceType: 'image',
            maxWidth: 512,
            maxHeight: 512,
        });
    }
    async uploadCategoryImage(buffer, fileName, mimeType) {
        this.validateFile(buffer, mimeType, ALLOWED_IMAGE_TYPES, 8 * 1024 * 1024);
        return this.provider.upload(buffer, fileName, mimeType, {
            folder: exports.UPLOAD_FOLDERS.CATEGORIES,
            resourceType: 'image',
            maxWidth: 1200,
            maxHeight: 800,
        });
    }
    async delete(publicId, resourceType) {
        return this.provider.delete(publicId, resourceType);
    }
    async getSignedUrl(publicId, expiresIn) {
        return this.provider.getSignedUrl(publicId, expiresIn);
    }
    validateFile(buffer, mimeType, allowedTypes, maxBytes) {
        if (!allowedTypes.includes(mimeType)) {
            throw new common_1.BadRequestException(`File type "${mimeType}" is not allowed. Accepted: ${allowedTypes.join(', ')}`);
        }
        if (buffer.length > maxBytes) {
            const mb = (maxBytes / 1024 / 1024).toFixed(0);
            throw new common_1.BadRequestException(`File exceeds the maximum allowed size of ${mb} MB`);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __param(1, (0, common_1.Inject)(cloudinary_provider_1.CloudinaryProvider)),
    __param(2, (0, common_1.Inject)(r2_provider_1.R2Provider)),
    __param(3, (0, common_1.Inject)(local_provider_1.LocalProvider)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cloudinary_provider_1.CloudinaryProvider,
        r2_provider_1.R2Provider,
        local_provider_1.LocalProvider])
], UploadService);
//# sourceMappingURL=upload.service.js.map