"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubscriptionsWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const crypto = __importStar(require("crypto"));
const subscriptions_service_1 = require("./subscriptions.service");
function safeSignatureEqual(a, b) {
    if (!a || !b)
        return false;
    const ba = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    if (ba.length !== bb.length)
        return false;
    return crypto.timingSafeEqual(ba, bb);
}
const SUBSCRIPTION_EVENTS = new Set([
    'subscription.create',
    'invoice.update',
    'invoice.payment_failed',
    'subscription.disable',
    'subscription.not_renew',
]);
let SubscriptionsWebhookController = SubscriptionsWebhookController_1 = class SubscriptionsWebhookController {
    config;
    subscriptions;
    logger = new common_1.Logger(SubscriptionsWebhookController_1.name);
    constructor(config, subscriptions) {
        this.config = config;
        this.subscriptions = subscriptions;
    }
    async paystackWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody)
            return { received: true };
        const secret = this.config.get('PAYSTACK_SECRET_KEY', '');
        const expectedSig = crypto
            .createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex');
        if (!safeSignatureEqual(expectedSig, signature ?? '')) {
            throw new common_1.UnauthorizedException('Invalid Paystack webhook signature');
        }
        let event;
        try {
            event = JSON.parse(rawBody.toString('utf8'));
        }
        catch (err) {
            this.logger.error('Failed to parse Paystack webhook body', err);
            return { received: true };
        }
        if (SUBSCRIPTION_EVENTS.has(event.event)) {
            await this.subscriptions.handleSubscriptionWebhook(event);
        }
        return { received: true };
    }
};
exports.SubscriptionsWebhookController = SubscriptionsWebhookController;
__decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Post)('webhook/paystack'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Paystack webhook receiver for subscription billing (no auth — verified via HMAC-SHA512)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsWebhookController.prototype, "paystackWebhook", null);
exports.SubscriptionsWebhookController = SubscriptionsWebhookController = SubscriptionsWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('payments'),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __param(1, (0, common_1.Inject)(subscriptions_service_1.SubscriptionsService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        subscriptions_service_1.SubscriptionsService])
], SubscriptionsWebhookController);
//# sourceMappingURL=subscriptions-webhook.controller.js.map