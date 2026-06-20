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
exports.AdminVendorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const vendors_service_1 = require("../vendors/vendors.service");
const review_kyc_dto_1 = require("../vendors/dto/review-kyc.dto");
const admin_service_1 = require("./admin.service");
const audit_service_1 = require("../../common/audit/audit.service");
const admin_query_dto_1 = require("./dto/admin-query.dto");
let AdminVendorsController = class AdminVendorsController {
    vendorsService;
    admin;
    audit;
    constructor(vendorsService, admin, audit) {
        this.vendorsService = vendorsService;
        this.admin = admin;
        this.audit = audit;
    }
    list(query) {
        return this.admin.listVendors(query);
    }
    listPendingKyc() {
        return this.vendorsService.listPendingKyc();
    }
    async reviewKyc(req, id, dto) {
        const adminId = req.user.id;
        const result = await this.vendorsService.reviewKyc(id, dto, adminId);
        this.audit.record({
            userId: adminId,
            action: `vendor.kyc.${dto.decision === 'APPROVE' ? 'approved' : 'rejected'}`,
            resourceType: 'vendor',
            resourceId: id,
            metadata: { decision: dto.decision, reason: dto.rejectionReason ?? null },
            ipAddress: req.ip,
        });
        return result;
    }
};
exports.AdminVendorsController = AdminVendorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List vendors (filter by KYC status / tier / search)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_query_dto_1.VendorQueryDto]),
    __metadata("design:returntype", void 0)
], AdminVendorsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('kyc/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'List vendors awaiting KYC review' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminVendorsController.prototype, "listPendingKyc", null);
__decorate([
    (0, common_1.Patch)(':id/kyc'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject a vendor KYC submission' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Vendor UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_kyc_dto_1.ReviewKycDto]),
    __metadata("design:returntype", Promise)
], AdminVendorsController.prototype, "reviewKyc", null);
exports.AdminVendorsController = AdminVendorsController = __decorate([
    (0, swagger_1.ApiTags)('Admin – Vendors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/vendors'),
    __param(0, (0, common_1.Inject)(vendors_service_1.VendorsService)),
    __param(1, (0, common_1.Inject)(admin_service_1.AdminService)),
    __param(2, (0, common_1.Inject)(audit_service_1.AuditService)),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService,
        admin_service_1.AdminService,
        audit_service_1.AuditService])
], AdminVendorsController);
//# sourceMappingURL=admin-vendors.controller.js.map