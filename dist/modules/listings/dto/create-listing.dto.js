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
exports.CreateListingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateListingDto {
    categoryId;
    title;
    description;
    pricingType;
    basePrice;
    location;
    tags;
    isRentable;
    perDayRate;
    depositAmount;
    mediaUrls;
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'Category UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'Listing title', example: 'Premium Wedding Photography' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'Full listing description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PricingType, enumName: 'PricingType', description: 'FIXED | QUOTE | STARTING_FROM' }),
    (0, class_validator_1.IsEnum)(client_1.PricingType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "pricingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Base price (required for FIXED / STARTING_FROM)', example: 250000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'object',
        additionalProperties: true,
        description: 'Service location: { city, state, country, address? }',
        example: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Searchable tags', example: ['outdoor', 'traditional'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'boolean', description: 'Whether this listing can be rented by the day' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "isRentable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Per-day rental rate', example: 50000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "perDayRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Deposit amount for rentals', example: 20000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        description: 'Image URLs (uploaded via /upload/listing/image), in display order',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "mediaUrls", void 0);
//# sourceMappingURL=create-listing.dto.js.map