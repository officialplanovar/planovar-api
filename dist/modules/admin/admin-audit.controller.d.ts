import { AuditService } from '../../common/audit/audit.service';
import { AuditQueryDto } from './dto/admin-query.dto';
export declare class AdminAuditController {
    private readonly audit;
    constructor(audit: AuditService);
    list(query: AuditQueryDto): Promise<{
        data: ({
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
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
}
