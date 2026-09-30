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
exports.SendQuoteDto = exports.QuoteLineItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class QuoteLineItemDto {
    label;
    amount;
}
exports.QuoteLineItemDto = QuoteLineItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Man power' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuoteLineItemDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QuoteLineItemDto.prototype, "amount", void 0);
class SendQuoteDto {
    clientId;
    listingId;
    eventId;
    lineItems;
    paymentTerms;
    validForDays;
    validUntil;
    description;
    notes;
}
exports.SendQuoteDto = SendQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client user id (recipient)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Listing the quote is for', format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Event this belongs to', format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [QuoteLineItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuoteLineItemDto),
    __metadata("design:type", Array)
], SendQuoteDto.prototype, "lineItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Free-text payment terms the vendor writes (e.g. "50% on booking, balance on delivery"). Not enforced by the platform.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "paymentTerms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7, description: 'Days the quote stays valid (default 7)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SendQuoteDto.prototype, "validForDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Explicit expiry (overrides validForDays)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendQuoteDto.prototype, "notes", void 0);
//# sourceMappingURL=send-quote.dto.js.map