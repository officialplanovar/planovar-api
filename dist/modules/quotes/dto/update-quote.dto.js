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
exports.UpdateQuoteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_quote_dto_1 = require("./create-quote.dto");
class UpdateQuoteDto {
    notes;
    description;
    validUntil;
    paymentStructure;
    escrowPercentage;
    totalAmount;
    lineItems;
    installments;
}
exports.UpdateQuoteDto = UpdateQuoteDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', example: '2026-09-01T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.QuotePaymentStructure, enumName: 'QuotePaymentStructure' }),
    (0, class_validator_1.IsEnum)(client_1.QuotePaymentStructure),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "paymentStructure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "escrowPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [create_quote_dto_1.CreateQuoteLineItemDto], description: 'Replaces all existing line items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_quote_dto_1.CreateQuoteLineItemDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateQuoteDto.prototype, "lineItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [create_quote_dto_1.CreateInstallmentDto], description: 'Replaces all existing installments' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_quote_dto_1.CreateInstallmentDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateQuoteDto.prototype, "installments", void 0);
//# sourceMappingURL=update-quote.dto.js.map