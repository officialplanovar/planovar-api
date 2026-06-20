"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_categories_controller_1 = require("./admin-categories.controller");
const admin_vendors_controller_1 = require("./admin-vendors.controller");
const admin_dashboard_controller_1 = require("./admin-dashboard.controller");
const admin_users_controller_1 = require("./admin-users.controller");
const admin_subscriptions_controller_1 = require("./admin-subscriptions.controller");
const admin_audit_controller_1 = require("./admin-audit.controller");
const admin_service_1 = require("./admin.service");
const categories_module_1 = require("../categories/categories.module");
const vendors_module_1 = require("../vendors/vendors.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [categories_module_1.CategoriesModule, vendors_module_1.VendorsModule],
        controllers: [
            admin_categories_controller_1.AdminCategoriesController,
            admin_vendors_controller_1.AdminVendorsController,
            admin_dashboard_controller_1.AdminDashboardController,
            admin_users_controller_1.AdminUsersController,
            admin_subscriptions_controller_1.AdminSubscriptionsController,
            admin_audit_controller_1.AdminAuditController,
        ],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map