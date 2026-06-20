import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntry {
  /** Acting admin/user id (null for system actions). */
  userId?: string | null;
  /** Verb-ish action key, e.g. `vendor.kyc.approved`, `user.suspended`. */
  action: string;
  /** Entity type the action targeted, e.g. `vendor`, `user`, `dispute`. */
  resourceType: string;
  /** Id of the affected entity, when applicable. */
  resourceId?: string | null;
  /** Extra structured context (decision, before/after, reason…). */
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Writes immutable audit-trail rows. Logging must never break the action it
 * records, so `record()` is fire-and-forget (failures are logged, not thrown).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  record(entry: AuditEntry): void {
    this.prisma.auditLog
      .create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId ?? null,
          metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue,
          ipAddress: entry.ipAddress ?? null,
        },
      })
      .catch((err) =>
        this.logger.warn(`Failed to write audit log (${entry.action}): ${err}`),
      );
  }

  async list(params: {
    resourceType?: string;
    action?: string;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const { resourceType, action, search } = params;
    const take = Math.min(params.take ?? 50, 200);
    const skip = params.skip ?? 0;

    const where: Prisma.AuditLogWhereInput = {
      ...(resourceType && { resourceType }),
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { action: { contains: search, mode: 'insensitive' } },
          { resourceType: { contains: search, mode: 'insensitive' } },
          { resourceId: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: rows, meta: { total, take, skip } };
  }
}
