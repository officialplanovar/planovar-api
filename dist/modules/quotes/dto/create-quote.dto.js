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
exports.CreateQuoteDto = exports.CreateInstallmentDto = exports.CreateQuoteLineItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateQuoteLineItemDto {
    label;
    amount;
    sortOrder;
}
exports.CreateQuoteLineItemDto = CreateQuoteLineItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'Photography — full day coverage' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuoteLineItemDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 250000, description: 'Line item amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateQuoteLineItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateQuoteLineItemDto.prototype, "sortOrder", void 0);
class CreateInstallmentDto {
    label;
    type;
    percentage;
    dueAt;
    sortOrder;
}
exports.CreateInstallmentDto = CreateInstallmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: 'Initial deposit — 50%' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.InstallmentType, enumName: 'InstallmentType' }),
    (0, class_validator_1.IsEnum)(client_1.InstallmentType),
    __metadata("design:type", String)
], CreateInstallmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 50, description: 'Percentage of total (0–100)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateInstallmentDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: '2026-10-01T00:00:00.000Z', description: 'Due date (ISO)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInstallmentDto.prototype, "dueAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateInstallmentDto.prototype, "sortOrder", void 0);
class CreateQuoteDto {
    bookingId;
    paymentStructure;
    totalAmount;
    escrowPercentage;
    validUntil;
    notes;
    description;
    lineItems;
    installments;
}
exports.CreateQuoteDto = CreateQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'uuid', description: 'Booking UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.QuotePaymentStructure, enumName: 'QuotePaymentStructure' }),
    (0, class_validator_1.IsEnum)(client_1.QuotePaymentStructure),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "paymentStructure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'number', example: 500000, description: 'Total quote amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateQuoteDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', example: 30, description: 'Escrow % (required for CUSTOM_ESCROW)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateQuoteDto.prototype, "escrowPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', example: '2026-09-01T00:00:00.000Z', description: 'Quote valid until date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateQuoteLineItemDto], description: 'At least one line item required' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateQuoteLineItemDto),
    __metadata("design:type", Array)
], CreateQuoteDto.prototype, "lineItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CreateInstallmentDto], description: 'Required for INSTALLMENTS or CUSTOM_ESCROW' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInstallmentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuoteDto.prototype, "installments", void 0);
//# sourceMappingURL=create-quote.dto.js.map