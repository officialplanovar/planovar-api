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
var CloudinaryProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryProvider = CloudinaryProvider_1 = class CloudinaryProvider {
    config;
    logger = new common_1.Logger(CloudinaryProvider_1.name);
    configured;
    constructor(config) {
        this.config = config;
        const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = config.get('CLOUDINARY_API_KEY');
        const apiSecret = config.get('CLOUDINARY_API_SECRET');
        if (cloudName && apiKey && apiSecret) {
            cloudinary_1.v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
            this.configured = true;
            this.logger.log('Cloudinary configured');
        }
        else {
            this.configured = false;
            this.logger.warn('Cloudinary credentials not set — file uploads will fail at runtime. ' +
                'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
        }
    }
    async upload(buffer, fileName, mimeType, options) {
        if (!this.configured) {
            throw new common_1.InternalServerErrorException('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
        }
        const rawType = options.resourceType ?? this.inferResourceType(mimeType);
        const resourceType = rawType === 'audio' ? 'video' : rawType;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: options.folder,
                resource_type: resourceType,
                ...(options.maxWidth || options.maxHeight
                    ? {
                        transformation: [
                            {
                                width: options.maxWidth,
                                height: options.maxHeight,
                                crop: 'limit',
                            },
                        ],
                    }
                    : {}),
                context: { original_filename: fileName },
            }, (error, result) => {
                if (error || !result) {
                    this.logger.error('Cloudinary upload failed', error);
                    return reject(new Error(error?.message ?? 'Cloudinary upload failed'));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    fileName,
                    mimeType,
                    size: result.bytes,
                    width: result.width,
                    height: result.height,
                    duration: result.duration,
                    provider: 'cloudinary',
                });
            });
            const readable = new stream_1.Readable();
            readable.push(buffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }
    async delete(publicId, resourceType = 'image') {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
        }
        catch (err) {
            this.logger.warn(`Cloudinary delete failed for ${publicId}`, err);
        }
    }
    async getSignedUrl(publicId, expiresIn = 3600) {
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        return cloudinary_1.v2.url(publicId, {
            sign_url: true,
            type: 'authenticated',
            expires_at: expiration,
            secure: true,
        });
    }
    inferResourceType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'video';
        return 'raw';
    }
};
exports.CloudinaryProvider = CloudinaryProvider;
exports.CloudinaryProvider = CloudinaryProvider = CloudinaryProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryProvider);
//# sourceMappingURL=cloudinary.provider.js.map