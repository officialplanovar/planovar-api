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
exports.CreateOrderRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateOrderRequestDto {
    listingId;
    fulfilmentType;
    deliveryMethod;
    amount;
    pickupAt;
    returnAt;
    eventId;
    address;
    notes;
}
exports.CreateOrderRequestDto = CreateOrderRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [client_1.FulfilmentType.PURCHASE, client_1.FulfilmentType.RENTAL] }),
    (0, class_validator_1.IsEnum)(client_1.FulfilmentType),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "fulfilmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DeliveryMethod }),
    (0, class_validator_1.IsEnum)(client_1.DeliveryMethod),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "deliveryMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000, description: 'Item / rental price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOrderRequestDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rental pickup date/time (ISO)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "pickupAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rental return date/time (ISO)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "returnAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderRequestDto.prototype, "notes", void 0);
//# sourceMappingURL=create-order-request.dto.js.map