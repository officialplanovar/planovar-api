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
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
const prisma_service_1 = require("../../prisma/prisma.service");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    config;
    prisma;
    logger = new common_1.Logger(FirebaseService_1.name);
    app = null;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    onModuleInit() {
        const projectId = this.config.get('FIREBASE_PROJECT_ID');
        const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.config.get('FIREBASE_PRIVATE_KEY');
        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase credentials not set — push notifications will be skipped. ' +
                'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
            return;
        }
        if (!admin.apps.length) {
            this.app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        }
        else {
            this.app = admin.app();
        }
        this.logger.log('Firebase Admin initialised');
    }
    async pushToUser(userId, payload) {
        if (!this.app)
            return;
        const tokens = await this.prisma.devicePushToken.findMany({
            where: { userId },
            select: { id: true, token: true, platform: true },
        });
        if (!tokens.length)
            return;
        await this.sendMulticast(tokens.map((t) => t.token), payload);
    }
    async pushToUsers(userIds, payload) {
        if (!this.app || !userIds.length)
            return;
        const tokens = await this.prisma.devicePushToken.findMany({
            where: { userId: { in: userIds } },
            select: { id: true, token: true },
        });
        if (!tokens.length)
            return;
        await this.sendMulticast(tokens.map((t) => t.token), payload);
    }
    async registerToken(userId, token, platform) {
        await this.prisma.devicePushToken.upsert({
            where: { token },
            create: { userId, token, platform },
            update: { userId, platform },
        });
    }
    async removeToken(token) {
        await this.prisma.devicePushToken.deleteMany({ where: { token } });
    }
    async sendMulticast(tokens, payload) {
        if (!this.app || !tokens.length)
            return;
        const chunks = this.chunk(tokens, 500);
        for (const chunk of chunks) {
            const message = {
                tokens: chunk,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data
                    ? Object.fromEntries(Object.entries(payload.data).map(([k, v]) => [k, String(v)]))
                    : undefined,
                android: {
                    priority: 'high',
                    notification: { sound: 'default' },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: payload.badge,
                        },
                    },
                },
            };
            try {
                const response = await admin.messaging().sendEachForMulticast(message);
                const staleTokens = [];
                response.responses.forEach((resp, i) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (code === 'messaging/registration-token-not-registered' ||
                            code === 'messaging/invalid-registration-token') {
                            staleTokens.push(chunk[i]);
                        }
                    }
                });
                if (staleTokens.length) {
                    await this.prisma.devicePushToken.deleteMany({
                        where: { token: { in: staleTokens } },
                    });
                    this.logger.debug(`Removed ${staleTokens.length} stale FCM tokens`);
                }
            }
            catch (err) {
                this.logger.error('FCM multicast failed', err);
            }
        }
    }
    chunk(arr, size) {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __param(1, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map