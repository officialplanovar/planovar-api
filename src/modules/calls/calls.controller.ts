import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CallsService } from './calls.service';
import { CallTokenDto } from './dto/call-token.dto';

@ApiTags('calls')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(@Inject(CallsService) private readonly callsService: CallsService) {}

  @Post('token')
  @ApiOperation({
    summary: 'Get a LiveKit room token for a conversation (Gold-tier only)',
  })
  token(@Req() req: Request, @Body() dto: CallTokenDto) {
    return this.callsService.createToken((req as any).user.id, dto.conversationId);
  }
}
