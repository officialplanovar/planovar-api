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
exports.PaypalAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PaypalAdapter = class PaypalAdapter {
    config;
    name = 'paypal';
    constructor(config) {
        this.config = config;
    }
    createSubscription(_input) {
        throw new common_1.NotImplementedException('PaypalAdapter.createSubscription (Phase 1)');
    }
    cancelSubscription(_input) {
        throw new common_1.NotImplementedException('PaypalAdapter.cancelSubscription (Phase 1)');
    }
    verifyAndParseWebhook(_input) {
        throw new common_1.NotImplementedException('PaypalAdapter.verifyAndParseWebhook (Phase 1)');
    }
};
exports.PaypalAdapter = PaypalAdapter;
exports.PaypalAdapter = PaypalAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaypalAdapter);
//# sourceMappingURL=paypal.adapter.js.map