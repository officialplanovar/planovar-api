import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { BookingStatus } from '@prisma/client';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(@Inject(BookingsService) private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking request (client)' })
  create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create((req as any).user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings — auto-detects vendor or client role' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    let parsedStatus: BookingStatus | undefined;
    if (status) {
      const upper = status.toUpperCase();
      if (!(upper in BookingStatus)) {
        throw new BadRequestException(
          `Invalid status "${status}" — use ${Object.keys(BookingStatus).join(' | ')}`,
        );
      }
      parsedStatus = upper as BookingStatus;
    }
    return this.bookingsService.findAll(
      (req as any).user.id,
      (req as any).user.role,
      parsedStatus,
      take ? parseInt(take, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get('inbox/summary')
  @ApiOperation({ summary: 'Vendor inbox: booking counts per status (PENDING = action needed)' })
  inboxSummary(@Req() req: Request) {
    return this.bookingsService.inboxSummary((req as any).user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details with quotes' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.bookingsService.findOne(id, (req as any).user.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Vendor confirms a pending booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  confirm(@Req() req: Request, @Param('id') id: string) {
    return this.bookingsService.confirm(id, (req as any).user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Vendor rejects a pending booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
    },
  })
  reject(@Req() req: Request, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.bookingsService.reject(id, (req as any).user.id, reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Client cancels a booking (PENDING or CONFIRMED)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  cancel(@Req() req: Request, @Param('id') id: string) {
    return this.bookingsService.cancel(id, (req as any).user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Vendor marks a confirmed booking as complete' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  complete(@Req() req: Request, @Param('id') id: string) {
    return this.bookingsService.complete(id, (req as any).user.id);
  }
}
