import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin – Team')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/team')
export class AdminTeamController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List admin team members' })
  list() {
    return this.admin.listAdmins();
  }

  @Post('promote')
  @ApiOperation({ summary: 'Promote an existing user to ADMIN by email' })
  promote(@Body() body: { email: string }) {
    return this.admin.promoteToAdmin(body.email);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: "Change a user's role (e.g. demote an admin)" })
  @ApiParam({ name: 'id' })
  setRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.admin.setUserRole(id, body.role);
  }
}
