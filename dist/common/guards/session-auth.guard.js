"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_config_1 = require("../../auth/auth.config");
function toWebHeaders(rawHeaders) {
    const headers = new Headers();
    for (const [key, value] of Object.entries(rawHeaders)) {
        if (value === undefined)
            continue;
        if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
        }
        else {
            headers.set(key, value);
        }
    }
    return headers;
}
let SessionAuthGuard = class SessionAuthGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const session = await auth_config_1.auth.api.getSession({
            headers: toWebHeaders(request.headers),
        });
        if (!session?.user) {
            throw new common_1.UnauthorizedException();
        }
        request.user = session.user;
        request.session = session.session;
        return true;
    }
};
exports.SessionAuthGuard = SessionAuthGuard;
exports.SessionAuthGuard = SessionAuthGuard = __decorate([
    (0, common_1.Injectable)()
], SessionAuthGuard);
//# sourceMappingURL=session-auth.guard.js.map