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
var R2Provider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2Provider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
const path_1 = require("path");
let R2Provider = R2Provider_1 = class R2Provider {
    config;
    logger = new common_1.Logger(R2Provider_1.name);
    client;
    bucket;
    publicUrl;
    constructor(config) {
        this.config = config;
        const accountId = config.getOrThrow('R2_ACCOUNT_ID');
        this.bucket = config.getOrThrow('R2_BUCKET_NAME');
        this.publicUrl = config.getOrThrow('R2_PUBLIC_URL');
        this.client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.getOrThrow('R2_ACCESS_KEY_ID'),
                secretAccessKey: config.getOrThrow('R2_SECRET_ACCESS_KEY'),
            },
        });
    }
    async upload(buffer, fileName, mimeType, options) {
        const ext = (0, path_1.extname)(fileName) || '';
        const key = `${options.folder}/${(0, crypto_1.randomUUID)()}${ext}`;
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                Metadata: { 'original-filename': encodeURIComponent(fileName) },
            },
        });
        await upload.done();
        return {
            url: `${this.publicUrl}/${key}`,
            publicId: key,
            fileName,
            mimeType,
            size: buffer.length,
            provider: 'r2',
        };
    }
    async delete(publicId) {
        try {
            await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: publicId }));
        }
        catch (err) {
            this.logger.warn(`R2 delete failed for ${publicId}`, err);
        }
    }
    async getSignedUrl(publicId, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: publicId,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
    }
};
exports.R2Provider = R2Provider;
exports.R2Provider = R2Provider = R2Provider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2Provider);
//# sourceMappingURL=r2.provider.js.map