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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const firebase_service_1 = require("../../common/firebase/firebase.service");
let NotificationsService = class NotificationsService {
    prisma;
    firebaseService;
    constructor(prisma, firebaseService) {
        this.prisma = prisma;
        this.firebaseService = firebaseService;
    }
    async create(userId, type, title, body, data) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                data: data !== undefined ? data : client_1.Prisma.JsonNull,
            },
        });
        await this.firebaseService.pushToUser(userId, { title, body, data });
        return notification;
    }
    async createBulk(userIds, type, title, body, data) {
        const jsonData = data !== undefined ? data : client_1.Prisma.JsonNull;
        await this.prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                type,
                title,
                body,
                data: jsonData,
            })),
        });
        await this.firebaseService.pushToUsers(userIds, { title, body, data });
    }
    async list(userId, take = 20, skip = 0) {
        const [data, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data,
            meta: {
                total,
                take,
                skip,
                hasMore: skip + take < total,
                unreadCount,
            },
        };
    }
    async markRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        if (notification.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { updated: result.count };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(firebase_service_1.FirebaseService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        firebase_service_1.FirebaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map