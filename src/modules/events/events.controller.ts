import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('events')
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event (status starts as DRAFT)' })
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    return this.eventsService.create((req as any).user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the current client's events" })
  findAll(@Req() req: Request) {
    return this.eventsService.findAll((req as any).user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details including vendors and bookings' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.eventsService.findOne(id, (req as any).user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event details' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, (req as any).user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  cancel(@Req() req: Request, @Param('id') id: string) {
    return this.eventsService.cancel(id, (req as any).user.id);
  }

  @Post(':id/vendors')
  @ApiOperation({ summary: 'Add a vendor to an event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['vendorId'],
      properties: {
        vendorId: { type: 'string', format: 'uuid' },
      },
    },
  })
  addVendor(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('vendorId') vendorId: string,
  ) {
    return this.eventsService.addVendor(id, (req as any).user.id, vendorId);
  }

  @Delete(':id/vendors/:vendorId')
  @ApiOperation({ summary: 'Remove a vendor from an event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiParam({ name: 'vendorId', description: 'Vendor profile UUID' })
  removeVendor(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('vendorId') vendorId: string,
  ) {
    return this.eventsService.removeVendor(id, (req as any).user.id, vendorId);
  }
}
