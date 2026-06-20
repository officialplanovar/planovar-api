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
exports.UpdateListingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class UpdateListingDto {
    categoryId;
    title;
    description;
    pricingType;
    basePrice;
    location;
    isActive;
    isRentable;
    perDayRate;
    depositAmount;
    tags;
}
exports.UpdateListingDto = UpdateListingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Category UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Listing title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Full listing description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PricingType, enumName: 'PricingType' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PricingType),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "pricingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Base price', example: 250000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateListingDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'object',
        additionalProperties: true,
        description: 'Service location: { city, state, country, address? }',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'boolean', description: 'Whether the listing is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateListingDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'boolean', description: 'Whether this listing is rentable' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateListingDto.prototype, "isRentable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Per-day rental rate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateListingDto.prototype, "perDayRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Deposit amount for rentals' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateListingDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Search tags' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateListingDto.prototype, "tags", void 0);
//# sourceMappingURL=update-listing.dto.js.map