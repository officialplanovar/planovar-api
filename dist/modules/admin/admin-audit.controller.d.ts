import { AuditService } from '../../common/audit/audit.service';
import { AuditQueryDto } from './dto/admin-query.dto';
export declare class AdminAuditController {
    private readonly audit;
    constructor(audit: AuditService);
    list(query: AuditQueryDto): Promise<{
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
