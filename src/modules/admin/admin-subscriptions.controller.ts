import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { SubscriptionQueryDto } from './dto/admin-query.dto';

@ApiTags('Admin – Subscriptions')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/subscriptions')
export class AdminSubscriptionsController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List vendor subscriptions (filter by status/tier)' })
  list(@Query() query: SubscriptionQueryDto) {
    return this.admin.listSubscriptions(query);
  }
}
