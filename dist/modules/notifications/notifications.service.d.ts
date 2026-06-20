import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private readonly prisma;
    private readonly firebaseService;
    constructor(prisma: PrismaService, firebaseService: FirebaseService);
    create(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, string>): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        userId: string;
        body: string;
        data: Prisma.JsonValue | null;
        title: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createBulk(userIds: string[], type: NotificationType, title: string, body: string, data?: Record<string, string>): Promise<void>;
    list(userId: string, take?: number, skip?: number): Promise<{
        data: {
            type: import("@prisma/client").$Enums.NotificationType;
            id: string;
            createdAt: Date;
            userId: string;
            body: string;
            data: Prisma.JsonValue | null;
            title: string;
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
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        userId: string;
        body: string;
        data: Prisma.JsonValue | null;
        title: string;
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
