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
exports.UpdateBankDetailsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateBankDetailsDto {
    bankCode;
    bankAccount;
    accountName;
}
exports.UpdateBankDetailsDto = UpdateBankDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        description: 'Bank code (e.g. 058 for GTBank)',
        example: '058',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankDetailsDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        description: '10-digit NUBAN bank account number',
        example: '0123456789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(10, 10),
    (0, class_validator_1.Matches)(/^\d{10}$/, { message: 'bankAccount must be a 10-digit number' }),
    __metadata("design:type", String)
], UpdateBankDetailsDto.prototype, "bankAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        description: 'Account name as verified by the bank',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBankDetailsDto.prototype, "accountName", void 0);
//# sourceMappingURL=update-bank-details.dto.js.map