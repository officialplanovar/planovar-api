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
exports.SubscribeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class SubscribeDto {
    planId;
    billingCycle;
    callbackUrl;
}
exports.SubscribeDto = SubscribeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'uuid',
        description: 'UUID of the subscription plan to subscribe to',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubscribeDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.BillingCycle,
        description: 'Billing cycle (defaults to MONTHLY)',
        example: client_1.BillingCycle.MONTHLY,
    }),
    (0, class_validator_1.IsEnum)(client_1.BillingCycle),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscribeDto.prototype, "billingCycle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        description: 'URL to redirect to after the billing provider checkout completes',
        example: 'https://planovar.com/dashboard/subscription',
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscribeDto.prototype, "callbackUrl", void 0);
//# sourceMappingURL=subscribe.dto.js.map