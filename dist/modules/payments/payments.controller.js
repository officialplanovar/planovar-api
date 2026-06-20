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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const transactions_enabled_guard_1 = require("../../common/guards/transactions-enabled.guard");
const initiate_payment_dto_1 = require("./dto/initiate-payment.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
const payments_service_1 = require("./payments.service");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    initiatePayment(req, dto) {
        return this.paymentsService.initiatePayment(req.user.id, dto);
    }
    verifyPayment(dto) {
        return this.paymentsService.verifyPayment(dto);
    }
    getTransactionHistory(req, take, skip) {
        return this.paymentsService.getTransactionHistory(req.user.id, take ? parseInt(take, 10) : 20, skip ? parseInt(skip, 10) : 0);
    }
    getInstallments(req, bookingId) {
        return this.paymentsService.getInstallmentsForBooking(bookingId, req.user.id);
    }
    releaseEscrow(req, holdId) {
        return this.paymentsService.releaseEscrow(holdId, req.user.id);
    }
    async paystackWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody)
            return { received: true };
        await this.paymentsService.handlePaystackWebhook(rawBody, signature ?? '');
        return { received: true };
    }
    async flutterwaveWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody)
            return { received: true };
        await this.paymentsService.handleFlutterwaveWebhook(rawBody, signature ?? '');
        return { received: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, transactions_enabled_guard_1.TransactionsEnabledGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate payment for an installment (client only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, initiate_payment_dto_1.InitiatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, transactions_enabled_guard_1.TransactionsEnabledGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a payment by reference' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_payment_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history for the current user (paginated, default 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number', description: 'Number of records (default 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number', description: 'Offset (default 0)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)('installments/:bookingId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all installments for a booking (client or vendor)' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getInstallments", null);
__decorate([
    (0, common_1.Post)('escrow/:holdId/release'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, transactions_enabled_guard_1.TransactionsEnabledGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Release an escrow hold (client or admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'holdId', description: 'EscrowHold UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('holdId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Post)('webhook/paystack'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Paystack webhook receiver (no auth — verified via HMAC-SHA512)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "paystackWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/flutterwave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Flutterwave webhook receiver (no auth — verified via secret hash header)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('verif-hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "flutterwaveWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __param(0, (0, common_1.Inject)(payments_service_1.PaymentsService)),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map