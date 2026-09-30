import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from '../../common/audit/audit.service';
import { AuditQueryDto } from './dto/admin-query.dto';

@ApiTags('Admin – Audit log')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(@Inject(AuditService) private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit-trail entries (filterable)' })
  list(@Query() query: AuditQueryDto) {
    return this.audit.list(query);
  }
}
