import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin – Dashboard')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminDashboardController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform overview stats + recent activity' })
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Subscription-revenue summary (MRR/ARR, by tier)' })
  revenue() {
    return this.admin.revenue();
  }
}
