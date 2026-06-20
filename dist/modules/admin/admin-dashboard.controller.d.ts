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
                email: string;
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            ipAddress: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            action: string;
            resourceType: string;
            resourceId: string | null;
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
