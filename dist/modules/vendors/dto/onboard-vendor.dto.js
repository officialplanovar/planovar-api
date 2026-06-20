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
exports.OnboardVendorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class OnboardVendorDto {
    businessName;
    slug;
    businessType;
    vendorType;
    description;
    logoUrl;
    coverUrl;
    phone;
    email;
    location;
    serviceRadiusKm;
    tags;
}
exports.OnboardVendorDto = OnboardVendorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'Lagos Lights Photography' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        example: 'lagos-lights-photography',
        description: 'URL-safe slug — lowercase letters, numbers, and hyphens only',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(60),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase alphanumeric with hyphens only',
    }),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.VendorBusinessType,
        description: 'Licensed business or freelancer',
        example: client_1.VendorBusinessType.LICENSED,
    }),
    (0, class_validator_1.IsEnum)(client_1.VendorBusinessType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.VendorType,
        description: 'What the vendor offers (defaults to BOTH)',
        example: client_1.VendorType.BOTH,
    }),
    (0, class_validator_1.IsEnum)(client_1.VendorType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "vendorType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: 'Professional wedding and event photographer based in Lagos.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Logo image URL', example: 'https://cdn.planovar.com/logos/abc.png' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Cover image URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "coverUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: '+2348012345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: 'hello@lagoslights.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardVendorDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'object',
        additionalProperties: true,
        example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria', lat: 6.45, lng: 3.39 },
        description: 'Vendor base location: city, state, country, lat/lng',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], OnboardVendorDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', example: 30, description: 'Service radius in km' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], OnboardVendorDto.prototype, "serviceRadiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        example: ['wedding', 'portrait', 'event'],
        description: 'Searchable category tags (min 3 recommended)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], OnboardVendorDto.prototype, "tags", void 0);
//# sourceMappingURL=onboard-vendor.dto.js.map