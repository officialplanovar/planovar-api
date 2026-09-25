import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin – Settings')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform settings' })
  get() {
    return this.admin.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update platform settings' })
  update(
    @Body()
    body: {
      platformName?: string;
      supportEmail?: string;
      currency?: string;
      region?: string;
      maintenanceMode?: boolean;
    },
  ) {
    return this.admin.updateSettings(body);
  }
}
