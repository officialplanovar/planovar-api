import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UserQueryDto } from './dto/admin-query.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';

@ApiTags('Admin – Users')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List users (filter by role / active / search)' })
  list(@Query() query: UserQueryDto) {
    return this.admin.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user with profile + counts' })
  @ApiParam({ name: 'id' })
  getOne(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Suspend or reactivate a user account' })
  @ApiParam({ name: 'id' })
  setStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SetUserActiveDto,
  ) {
    return this.admin.setUserActive(
      id,
      dto.isActive,
      (req as any).user.id,
      dto.reason,
      req.ip,
    );
  }
}
