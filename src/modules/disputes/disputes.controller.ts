import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { DisputeStatus, UserRole } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(@Inject(DisputesService) private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Raise a dispute for a booking (client or vendor)' })
  create(@Req() req: Request, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create((req as any).user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List disputes — own disputes for users, all for admins' })
  findAll(@Req() req: Request) {
    return this.disputesService.findAll((req as any).user.id, (req as any).user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details (participant or admin)' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.disputesService.findOne(id, (req as any).user.id, (req as any).user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin updates dispute status (UNDER_REVIEW or CLOSED)' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(DisputeStatus),
        },
      },
    },
  })
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: DisputeStatus,
  ) {
    return this.disputesService.updateStatus(id, status, (req as any).user.id);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin resolves a dispute' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  resolve(@Req() req: Request, @Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, dto, (req as any).user.id);
  }
}
