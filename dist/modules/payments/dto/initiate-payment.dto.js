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
exports.InitiatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitiatePaymentDto {
    installmentId;
    provider;
    callbackUrl;
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'uuid',
        description: 'UUID of the installment being paid',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "installmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        enum: ['paystack', 'flutterwave'],
        description: 'Payment provider — defaults to paystack',
    }),
    (0, class_validator_1.IsEnum)(['paystack', 'flutterwave']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        description: 'Redirect URL after Paystack payment completes',
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "callbackUrl", void 0);
//# sourceMappingURL=initiate-payment.dto.js.map