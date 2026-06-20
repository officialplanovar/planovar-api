import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    await this.firebaseService.pushToUser(userId, { title, body, data });

    return notification;
  }

  async createBulk(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const jsonData: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.JsonNull;

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

  async list(userId: string, take = 20, skip = 0) {
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

  async markRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}
