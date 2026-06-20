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
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const calls_service_1 = require("./calls.service");
const call_token_dto_1 = require("./dto/call-token.dto");
let CallsController = class CallsController {
    callsService;
    constructor(callsService) {
        this.callsService = callsService;
    }
    token(req, dto) {
        return this.callsService.createToken(req.user.id, dto.conversationId);
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Post)('token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a LiveKit room token for a conversation (Gold-tier only)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_token_dto_1.CallTokenDto]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "token", null);
exports.CallsController = CallsController = __decorate([
    (0, swagger_1.ApiTags)('calls'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('calls'),
    __param(0, (0, common_1.Inject)(calls_service_1.CallsService)),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map