import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(req: Request, take?: string, skip?: string): Promise<{
        data: {
            type: import("@prisma/client").$Enums.NotificationType;
            id: string;
            createdAt: Date;
            userId: string;
            body: string;
            data: import("@prisma/client/runtime/client").JsonValue | null;
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
    getUnreadCount(req: Request): Promise<{
        count: number;
    }>;
    markRead(req: Request, id: string): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        userId: string;
        body: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllRead(req: Request): Promise<{
        updated: number;
    }>;
}
