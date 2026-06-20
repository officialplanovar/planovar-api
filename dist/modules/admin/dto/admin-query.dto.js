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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditQueryDto = exports.SubscriptionQueryDto = exports.UserQueryDto = exports.VendorQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class PaginationDto {
    take;
    skip;
    search;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 200, default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], PaginationDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaginationDto.prototype, "skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "search", void 0);
class VendorQueryDto extends PaginationDto {
    kycStatus;
    tier;
}
exports.VendorQueryDto = VendorQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.KycStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.KycStatus),
    __metadata("design:type", String)
], VendorQueryDto.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SubscriptionTier }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionTier),
    __metadata("design:type", String)
], VendorQueryDto.prototype, "tier", void 0);
class UserQueryDto extends PaginationDto {
    role;
    isActive;
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    __metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by active state' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === 'true' ? true : value === 'false' ? false : value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserQueryDto.prototype, "isActive", void 0);
class SubscriptionQueryDto extends PaginationDto {
    status;
    tier;
}
exports.SubscriptionQueryDto = SubscriptionQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SubscriptionStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionStatus),
    __metadata("design:type", String)
], SubscriptionQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SubscriptionTier }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionTier),
    __metadata("design:type", String)
], SubscriptionQueryDto.prototype, "tier", void 0);
class AuditQueryDto extends PaginationDto {
    resourceType;
    action;
}
exports.AuditQueryDto = AuditQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "action", void 0);
//# sourceMappingURL=admin-query.dto.js.map