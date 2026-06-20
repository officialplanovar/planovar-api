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
var LocalProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let LocalProvider = class LocalProvider {
    static { LocalProvider_1 = this; }
    config;
    logger = new common_1.Logger(LocalProvider_1.name);
    publicDir = (0, path_1.join)(process.cwd(), 'public');
    baseUrl;
    static EXT_BY_MIME = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/heic': '.heic',
        'application/pdf': '.pdf',
    };
    constructor(config) {
        this.config = config;
        this.baseUrl = (config.get('API_BASE_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
        this.logger.log('Local filesystem upload provider active (public/uploads)');
    }
    async upload(buffer, fileName, mimeType, options) {
        const ext = (0, path_1.extname)(fileName) || LocalProvider_1.EXT_BY_MIME[mimeType] || '';
        const relDir = (0, path_1.join)('uploads', options.folder);
        const absDir = (0, path_1.join)(this.publicDir, relDir);
        await (0, promises_1.mkdir)(absDir, { recursive: true });
        const name = `${(0, crypto_1.randomUUID)()}${ext}`;
        const relPath = (0, path_1.join)(relDir, name);
        await (0, promises_1.writeFile)((0, path_1.join)(this.publicDir, relPath), buffer);
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
    async delete(publicId) {
        try {
            await (0, promises_1.unlink)((0, path_1.join)(this.publicDir, publicId));
        }
        catch (err) {
            this.logger.warn(`Local delete skipped for ${publicId}: ${err}`);
        }
    }
    async getSignedUrl(publicId) {
        return `${this.baseUrl}/${publicId}`;
    }
};
exports.LocalProvider = LocalProvider;
exports.LocalProvider = LocalProvider = LocalProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalProvider);
//# sourceMappingURL=local.provider.js.map