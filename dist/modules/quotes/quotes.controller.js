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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const create_quote_dto_1 = require("./dto/create-quote.dto");
const update_quote_dto_1 = require("./dto/update-quote.dto");
const quotes_service_1 = require("./quotes.service");
let QuotesController = class QuotesController {
    quotesService;
    constructor(quotesService) {
        this.quotesService = quotesService;
    }
    create(req, dto) {
        return this.quotesService.create(req.user.id, dto);
    }
    findAll(req) {
        return this.quotesService.findAll(req.user.id, req.user.role);
    }
    findOne(req, id) {
        return this.quotesService.findOne(id, req.user.id);
    }
    update(req, id, dto) {
        return this.quotesService.update(id, req.user.id, dto);
    }
    accept(req, id) {
        return this.quotesService.accept(id, req.user.id);
    }
    reject(req, id) {
        return this.quotesService.reject(id, req.user.id);
    }
};
exports.QuotesController = QuotesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor creates a quote for a booking' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_quote_dto_1.CreateQuoteDto]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List quotes — auto-detects vendor or client role' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quote details with line items and installments' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor updates a draft (unlocked) quote' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_quote_dto_1.UpdateQuoteDto]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiOperation)({
        summary: 'Client accepts the quote — locks terms and CONFIRMS the booking inquiry (no payment step)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Client declines the quote (conversation stays open)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "reject", null);
exports.QuotesController = QuotesController = __decorate([
    (0, swagger_1.ApiTags)('Quotes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('quotes'),
    __param(0, (0, common_1.Inject)(quotes_service_1.QuotesService)),
    __metadata("design:paramtypes", [quotes_service_1.QuotesService])
], QuotesController);
//# sourceMappingURL=quotes.controller.js.map