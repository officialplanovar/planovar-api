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
exports.AdminSubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
const admin_query_dto_1 = require("./dto/admin-query.dto");
let AdminSubscriptionsController = class AdminSubscriptionsController {
    admin;
    constructor(admin) {
        this.admin = admin;
    }
    list(query) {
        return this.admin.listSubscriptions(query);
    }
};
exports.AdminSubscriptionsController = AdminSubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List vendor subscriptions (filter by status/tier)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_query_dto_1.SubscriptionQueryDto]),
    __metadata("design:returntype", void 0)
], AdminSubscriptionsController.prototype, "list", null);
exports.AdminSubscriptionsController = AdminSubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Admin – Subscriptions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/subscriptions'),
    __param(0, (0, common_1.Inject)(admin_service_1.AdminService)),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminSubscriptionsController);
//# sourceMappingURL=admin-subscriptions.controller.js.map