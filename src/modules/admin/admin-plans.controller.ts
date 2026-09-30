import { Body, Controller, Get, Inject, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Admin – Plans')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/plans')
export class AdminPlansController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscription plans (raw stored pricing)' })
  list() {
    return this.admin.getPlans();
  }

  @Patch(':tier')
  @ApiOperation({ summary: 'Update a subscription plan by tier' })
  @ApiParam({ name: 'tier', description: 'BASIC | PREMIUM | GOLD' })
  update(@Param('tier') tier: string, @Body() body: UpdatePlanDto) {
    return this.admin.updatePlan(tier, body);
  }
}
