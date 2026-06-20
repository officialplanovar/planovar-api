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
exports.UpdateVendorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateVendorDto {
    businessName;
    slug;
    businessType;
    vendorType;
    description;
    phone;
    email;
    location;
    serviceRadiusKm;
    tags;
    logoUrl;
    coverUrl;
    portfolioUrls;
}
exports.UpdateVendorDto = UpdateVendorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: 'Lagos Lights Photography' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        example: 'lagos-lights-photography',
        description: 'URL-safe slug — lowercase letters, numbers, and hyphens only',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase alphanumeric with hyphens only',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.VendorBusinessType }),
    (0, class_validator_1.IsEnum)(client_1.VendorBusinessType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.VendorType }),
    (0, class_validator_1.IsEnum)(client_1.VendorType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "vendorType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: 'Professional wedding and event photographer.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: '+2348012345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: 'hello@lagoslights.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'object',
        additionalProperties: true,
        example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
        description: 'Vendor base location: city, state, country, lat/lng',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVendorDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', example: 30, description: 'Service radius in km' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateVendorDto.prototype, "serviceRadiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['wedding', 'portrait'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateVendorDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Logo image URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Cover image URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "coverUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Portfolio image URLs' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateVendorDto.prototype, "portfolioUrls", void 0);
//# sourceMappingURL=update-vendor.dto.js.map