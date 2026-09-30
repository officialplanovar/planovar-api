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
exports.AdminCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const categories_service_1 = require("../categories/categories.service");
const create_category_dto_1 = require("../categories/dto/create-category.dto");
const update_category_dto_1 = require("../categories/dto/update-category.dto");
const audit_service_1 = require("../../common/audit/audit.service");
let AdminCategoriesController = class AdminCategoriesController {
    categoriesService;
    audit;
    constructor(categoriesService, audit) {
        this.categoriesService = categoriesService;
        this.audit = audit;
    }
    findAll() {
        return this.categoriesService.findAllAdmin();
    }
    async create(req, dto) {
        const category = await this.categoriesService.create(dto);
        this.audit.record({
            userId: req.user.id,
            action: 'category.created',
            resourceType: 'category',
            resourceId: category.id,
            metadata: { name: category.name, slug: category.slug },
            ipAddress: req.ip,
        });
        return category;
    }
    async update(req, id, dto) {
        const category = await this.categoriesService.update(id, dto);
        this.audit.record({
            userId: req.user.id,
            action: 'category.updated',
            resourceType: 'category',
            resourceId: id,
            metadata: { fields: Object.keys(dto) },
            ipAddress: req.ip,
        });
        return category;
    }
    async remove(req, id) {
        const category = await this.categoriesService.remove(id);
        this.audit.record({
            userId: req.user.id,
            action: 'category.deactivated',
            resourceType: 'category',
            resourceId: id,
            ipAddress: req.ip,
        });
        return category;
    }
};
exports.AdminCategoriesController = AdminCategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all categories (including inactive) with metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event category' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a category (presentation, taxonomy, sort, active state)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a category (sets isActive = false)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "remove", null);
exports.AdminCategoriesController = AdminCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Admin – Categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/categories'),
    __param(0, (0, common_1.Inject)(categories_service_1.CategoriesService)),
    __param(1, (0, common_1.Inject)(audit_service_1.AuditService)),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService,
        audit_service_1.AuditService])
], AdminCategoriesController);
//# sourceMappingURL=admin-categories.controller.js.map