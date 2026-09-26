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
exports.SubmitKycDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SubmitKycDto {
    idDocumentUrl;
    idType;
    idCountry;
    businessRegDocumentUrl;
    businessRegCountry;
}
exports.SubmitKycDto = SubmitKycDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        description: 'URL of the uploaded government photo ID (JPG/PNG/PDF)',
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "idDocumentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of government ID',
        enum: ['passport', 'national_id', 'drivers_license'],
    }),
    (0, class_validator_1.IsIn)(['passport', 'national_id', 'drivers_license']),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "idType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'Country that issued the ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "idCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        description: 'URL of the uploaded business registration document (required for registered businesses)',
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "businessRegDocumentUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        description: 'Country where the business is registered',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "businessRegCountry", void 0);
//# sourceMappingURL=submit-kyc.dto.js.map