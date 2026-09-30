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
exports.IapController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const iap_verify_dto_1 = require("./dto/iap-verify.dto");
const iap_service_1 = require("./iap.service");
let IapController = class IapController {
    iap;
    constructor(iap) {
        this.iap = iap;
    }
    verify(req, dto) {
        return this.iap.verify(req.user.id, dto);
    }
    async appleWebhook(req, body) {
        await this.iap.handleAppleNotification(body ?? {});
        return { received: true };
    }
    async googleWebhook(req, body) {
        await this.iap.handleGoogleNotification(body ?? {});
        return { received: true };
    }
};
exports.IapController = IapController;
__decorate([
    (0, common_1.Post)('iap/verify'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Validate an Apple/Google in-app purchase and activate the vendor's subscription",
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, iap_verify_dto_1.IapVerifyDto]),
    __metadata("design:returntype", void 0)
], IapController.prototype, "verify", null);
__decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Post)('webhook/apple'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Apple App Store Server Notifications v2 receiver (signed JWS; no auth)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IapController.prototype, "appleWebhook", null);
__decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Post)('webhook/google'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Google Play Real-Time Developer Notifications receiver (Pub/Sub push; no auth)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IapController.prototype, "googleWebhook", null);
exports.IapController = IapController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    __param(0, (0, common_1.Inject)(iap_service_1.IapService)),
    __metadata("design:paramtypes", [iap_service_1.IapService])
], IapController);
//# sourceMappingURL=iap.controller.js.map