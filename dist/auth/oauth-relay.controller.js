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
exports.OAuthRelayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const node_1 = require("better-auth/node");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_config_1 = require("./auth.config");
const WEB_ORIGINS = new Set([
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    ...(process.env.CORS_ORIGINS ?? '').split(','),
    ...(process.env.TRUSTED_ORIGINS ?? '').split(','),
]
    .map((o) => o.trim())
    .filter(Boolean));
const MOBILE_SCHEMES = [
    'planovar://',
    'planovardev://',
    'planovarstaging://',
    'planovarvendor://',
    'planovarvendordev://',
    'planovarvendorstaging://',
];
function isAllowedRedirect(redirect) {
    if (!redirect)
        return false;
    if (MOBILE_SCHEMES.some((s) => redirect.startsWith(s)))
        return true;
    try {
        return WEB_ORIGINS.has(new URL(redirect).origin);
    }
    catch {
        return false;
    }
}
function readSessionToken(req) {
    const cookie = req.headers.cookie;
    if (!cookie)
        return null;
    const names = [
        '__Secure-better-auth.session_token',
        'better-auth.session_token',
    ];
    const parts = cookie.split(';').map((c) => c.trim());
    for (const name of names) {
        const prefix = `${name}=`;
        const hit = parts.find((c) => c.startsWith(prefix));
        if (hit)
            return hit.slice(prefix.length);
    }
    return null;
}
let OAuthRelayController = class OAuthRelayController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async start(redirect, intent, req, res) {
        if (!isAllowedRedirect(redirect)) {
            res.status(400).send('Invalid or missing redirect target');
            return;
        }
        const base = process.env.API_BASE_URL ?? 'http://localhost:3000';
        const intentParam = intent === 'vendor' || intent === 'client' ? `&intent=${intent}` : '';
        const callbackURL = `${base}/oauth/relay?redirect=${encodeURIComponent(redirect)}${intentParam}`;
        const response = await auth_config_1.auth.api.signInSocial({
            body: { provider: 'google', callbackURL },
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
        });
        const cookies = typeof response.headers.getSetCookie === 'function'
            ? response.headers.getSetCookie()
            : [response.headers.get('set-cookie')].filter((c) => !!c);
        for (const c of cookies)
            res.append('Set-Cookie', c);
        const data = (await response.json().catch(() => null));
        if (!data?.url) {
            res.status(502).send('Could not start Google sign-in');
            return;
        }
        res.redirect(data.url);
    }
    async relay(redirect, intent, req, res) {
        if (!isAllowedRedirect(redirect)) {
            res.status(400).send('Invalid or missing redirect target');
            return;
        }
        if (intent === 'vendor') {
            await this.typeNewVendor(req).catch(() => void 0);
        }
        const token = readSessionToken(req);
        const sep = redirect.includes('?') ? '&' : '?';
        if (!token) {
            res.redirect(`${redirect}${sep}auth_error=nosession`);
            return;
        }
        res.redirect(`${redirect}${sep}planovar_token=${encodeURIComponent(token)}`);
    }
    async typeNewVendor(req) {
        const session = await auth_config_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        const user = session?.user;
        if (!user || user.role === 'VENDOR')
            return;
        const createdMs = user.createdAt ? new Date(user.createdAt).getTime() : 0;
        if (Date.now() - createdMs > 60_000)
            return;
        await this.prisma.user.update({
            where: { id: user.id },
            data: { role: 'VENDOR' },
        });
    }
};
exports.OAuthRelayController = OAuthRelayController;
__decorate([
    (0, common_1.Get)('start'),
    __param(0, (0, common_1.Query)('redirect')),
    __param(1, (0, common_1.Query)('intent')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthRelayController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('relay'),
    __param(0, (0, common_1.Query)('redirect')),
    __param(1, (0, common_1.Query)('intent')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthRelayController.prototype, "relay", null);
exports.OAuthRelayController = OAuthRelayController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('oauth'),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OAuthRelayController);
//# sourceMappingURL=oauth-relay.controller.js.map