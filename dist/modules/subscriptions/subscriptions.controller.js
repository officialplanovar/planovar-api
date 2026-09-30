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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const subscriptions_service_1 = require("./subscriptions.service");
const subscribe_dto_1 = require("./dto/subscribe.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
let SubscriptionsController = class SubscriptionsController {
    subscriptionsService;
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    listPlans() {
        return this.subscriptionsService.listPlans();
    }
    getMySubscription(req) {
        return this.subscriptionsService.getMySubscription(req.user.id);
    }
    subscribe(req, dto, deviceId) {
        return this.subscriptionsService.subscribe(req.user.id, dto, deviceId);
    }
    changePlan(req, dto, deviceId) {
        return this.subscriptionsService.changePlan(req.user.id, dto, deviceId);
    }
    verifyPayment(req, dto) {
        return this.subscriptionsService.verifyPayment(req.user.id, dto.reference);
    }
    cancelSubscription(req) {
        return this.subscriptionsService.cancelSubscription(req.user.id);
    }
    async billingWebhook(req) {
        const rawBody = req.rawBody;
        if (!rawBody)
            return { received: true };
        return this.subscriptionsService.handleProviderWebhook(rawBody, req.headers);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all available subscription plans (Basic/Premium/Gold, USD)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get the authenticated vendor's active subscription" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Subscribe to a plan. Basic activates immediately; Premium/Gold require payment and return a checkout URL (activated on verify).',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-device-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subscribe_dto_1.SubscribeDto, String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('change'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Switch/upgrade to a different plan. Ends the current subscription and starts the chosen plan (Premium/Gold return a checkout URL).',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-device-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subscribe_dto_1.SubscribeDto, String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "changePlan", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Verify a paid plan's payment by Paystack reference; activates the plan on success.",
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_payment_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel the current subscription (stays active until the period ends).',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('billing/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Billing-provider webhook (Stripe, etc.) for the active PAYMENT_PROVIDER — signature-verified',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "billingWebhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    __param(0, (0, common_1.Inject)(subscriptions_service_1.SubscriptionsService)),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map