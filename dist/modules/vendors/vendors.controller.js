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
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const onboard_vendor_dto_1 = require("./dto/onboard-vendor.dto");
const update_vendor_dto_1 = require("./dto/update-vendor.dto");
const submit_kyc_dto_1 = require("./dto/submit-kyc.dto");
const vendors_service_1 = require("./vendors.service");
let VendorsController = class VendorsController {
    vendorsService;
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    onboard(req, dto) {
        return this.vendorsService.onboard(req.user.id, dto);
    }
    getMyProfile(req) {
        return this.vendorsService.getMyProfile(req.user.id);
    }
    updateMyProfile(req, dto) {
        return this.vendorsService.updateMyProfile(req.user.id, dto);
    }
    submitKyc(req, dto) {
        return this.vendorsService.submitKyc(req.user.id, dto);
    }
    getBySlug(slug) {
        return this.vendorsService.getBySlug(slug);
    }
    getPublicProfile(id) {
        return this.vendorsService.getPublicProfile(id);
    }
};
exports.VendorsController = VendorsController;
__decorate([
    (0, common_1.Post)('onboard'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Onboard current user as a vendor' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, onboard_vendor_dto_1.OnboardVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "onboard", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the current vendor profile' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update the current vendor profile' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Post)('me/kyc'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit KYC documents (NIN, + CAC for licensed businesses) for verification',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_kyc_dto_1.SubmitKycDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a public vendor profile by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Vendor slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a public vendor profile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Vendor UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getPublicProfile", null);
exports.VendorsController = VendorsController = __decorate([
    (0, swagger_1.ApiTags)('Vendors'),
    (0, common_1.Controller)('vendors'),
    __param(0, (0, common_1.Inject)(vendors_service_1.VendorsService)),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map