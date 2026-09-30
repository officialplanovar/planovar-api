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
exports.IapVerifyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class IapVerifyDto {
    platform;
    productId;
    purchaseToken;
}
exports.IapVerifyDto = IapVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['apple', 'google'],
        description: 'Store the purchase was made in',
    }),
    (0, class_validator_1.IsIn)(['apple', 'google']),
    __metadata("design:type", String)
], IapVerifyDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store product id (e.g. premium_monthly, gold_yearly) — must map to a Planovar tier/cycle',
        example: 'premium_monthly',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], IapVerifyDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Apple: the signed transaction JWS / transaction id from StoreKit. Google: the purchase token returned by Play Billing.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(4096),
    __metadata("design:type", String)
], IapVerifyDto.prototype, "purchaseToken", void 0);
//# sourceMappingURL=iap-verify.dto.js.map