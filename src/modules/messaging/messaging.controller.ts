import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('messaging')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(
    @Inject(MessagingService) private readonly messagingService: MessagingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a DIRECT or GROUP conversation' })
  async createConversation(
    @Req() req: Request,
    @Body() dto: CreateConversationDto,
  ) {
    const userId = (req as any).user.id as string;

    if (dto.type === 'DIRECT') {
      if (!dto.vendorId) {
        throw new Error('vendorId is required for DIRECT conversations');
      }
      return this.messagingService.createDirectConversation(
        userId,
        dto.vendorId,
        dto.bookingId,
      );
    }

    // GROUP
    if (!dto.eventId) {
      throw new Error('eventId is required for GROUP conversations');
    }
    return this.messagingService.createGroupConversation(
      userId,
      dto.eventId,
      dto.groupName,
    );
  }

  @Post('events/:eventId/group')
  @ApiOperation({
    summary: 'Get or create the event GROUP chat (auto-adds all event vendors)',
  })
  getOrCreateEventGroup(@Req() req: Request, @Param('eventId') eventId: string) {
    return this.messagingService.getOrCreateEventGroup(
      (req as any).user.id,
      eventId,
    );
  }

  @Get()
  @ApiOperation({ summary: "List the current user's conversations" })
  listConversations(@Req() req: Request) {
    return this.messagingService.listConversations((req as any).user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation with last 50 messages' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  getConversation(@Req() req: Request, @Param('id') id: string) {
    return this.messagingService.getConversation(id, (req as any).user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get paginated messages for a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'cursor', required: false, type: 'string', description: 'Message UUID cursor for pagination' })
  getMessages(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const takeNum = take ? parseInt(take, 10) : 50;
    return this.messagingService.getMessages(id, (req as any).user.id, takeNum, cursor);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  sendMessage(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, (req as any).user.id, dto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  markRead(@Req() req: Request, @Param('id') id: string) {
    return this.messagingService.markRead(id, (req as any).user.id);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add a participant to a GROUP conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: { userId: { type: 'string' } },
    },
  })
  addParticipant(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.messagingService.addGroupParticipant(
      id,
      (req as any).user.id,
      userId,
    );
  }
}
