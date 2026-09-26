import { AdminService } from './admin.service';
export declare class AdminDashboardController {
    private readonly admin;
    constructor(admin: AdminService);
    dashboard(): Promise<{
        stats: {
            pendingKyc: number;
            openDisputes: number;
            activeUsers: number;
            totalUsers: number;
            totalVendors: number;
            activeSubscriptions: number;
            mrr: number;
            currency: string;
        };
        recentActivity: ({
            user: {
                id: string;
                name: string;
                email: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string | null;
            action: string;
            resourceType: string;
            resourceId: string | null;
            ipAddress: string | null;
        })[];
    }>;
    revenue(): Promise<{
        currency: string;
        ngnToUsdRate: number;
        activeSubscriptions: number;
        mrr: number;
        arr: number;
        byTier: {
            [k: string]: {
                count: number;
                mrr: number;
            };
        };
    }>;
}
