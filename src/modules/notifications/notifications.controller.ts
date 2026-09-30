import {
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  list(
    @Req() req: Request,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const userId = (req as any).user.id as string;
    const takeNum = take ? parseInt(take, 10) : 20;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    return this.notificationsService.list(userId, takeNum, skipNum);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get the unread notification count for the current user' })
  getUnreadCount(@Req() req: Request) {
    return this.notificationsService.getUnreadCount((req as any).user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  markRead(@Req() req: Request, @Param('id') id: string) {
    return this.notificationsService.markRead(id, (req as any).user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Req() req: Request) {
    return this.notificationsService.markAllRead((req as any).user.id);
  }
}
