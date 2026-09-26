import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private readonly prisma;
    private readonly firebaseService;
    constructor(prisma: PrismaService, firebaseService: FirebaseService);
    create(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, string>): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        data: Prisma.JsonValue | null;
        body: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createBulk(userIds: string[], type: NotificationType, title: string, body: string, data?: Record<string, string>): Promise<void>;
    list(userId: string, take?: number, skip?: number): Promise<{
        data: {
            id: string;
            title: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.NotificationType;
            userId: string;
            data: Prisma.JsonValue | null;
            body: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
            hasMore: boolean;
            unreadCount: number;
        };
    }>;
    markRead(notificationId: string, userId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        data: Prisma.JsonValue | null;
        body: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
