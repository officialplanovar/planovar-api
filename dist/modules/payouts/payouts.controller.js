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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const transactions_enabled_guard_1 = require("../../common/guards/transactions-enabled.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const payouts_service_1 = require("./payouts.service");
const update_bank_details_dto_1 = require("./dto/update-bank-details.dto");
let PayoutsController = class PayoutsController {
    payoutsService;
    constructor(payoutsService) {
        this.payoutsService = payoutsService;
    }
    listForVendor(req) {
        return this.payoutsService.listForVendor(req.user.id);
    }
    getOne(req, id) {
        return this.payoutsService.getOne(id, req.user.id);
    }
    updateBankDetails(req, dto) {
        return this.payoutsService.updateBankDetails(req.user.id, dto);
    }
    listPending() {
        return this.payoutsService.listPending();
    }
    processPayout(id) {
        return this.payoutsService.processPayout(id);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List the authenticated vendor's payouts" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "listForVendor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single payout with line items' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payout UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('bank-details'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update vendor bank account for payouts' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_bank_details_dto_1.UpdateBankDetailsDto]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "updateBankDetails", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: list all pending payouts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "listPending", null);
__decorate([
    (0, common_1.Post)('admin/:id/process'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: trigger payout processing via Paystack' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payout UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "processPayout", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, swagger_1.ApiTags)('payouts'),
    (0, common_1.UseGuards)(transactions_enabled_guard_1.TransactionsEnabledGuard),
    (0, common_1.Controller)('payouts'),
    __param(0, (0, common_1.Inject)(payouts_service_1.PayoutsService)),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map