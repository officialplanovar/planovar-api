import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export interface AuditEntry {
    userId?: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    record(entry: AuditEntry): void;
    list(params: {
        resourceType?: string;
        action?: string;
        search?: string;
        take?: number;
        skip?: number;
    }): Promise<{
        data: ({
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
            metadata: Prisma.JsonValue | null;
            action: string;
            resourceType: string;
            resourceId: string | null;
        })[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
}
