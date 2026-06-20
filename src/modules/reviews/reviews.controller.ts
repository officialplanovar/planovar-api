import {
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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a completed booking (client)' })
  create(@Req() req: Request, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create((req as any).user.id, dto);
  }

  @Get('my')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reviews submitted by the current user' })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  findMyReviews(
    @Req() req: Request,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.reviewsService.findMyReviews(
      (req as any).user.id,
      take ? parseInt(take, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'List reviews for a vendor (public)' })
  @ApiParam({ name: 'vendorId', description: 'Vendor profile UUID' })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  findAllForVendor(
    @Param('vendorId') vendorId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.reviewsService.findAllForVendor(
      vendorId,
      take ? parseInt(take, 10) : 20,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review by ID (public)' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post(':id/respond')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vendor responds to a review' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  respond(@Req() req: Request, @Param('id') id: string, @Body() dto: ReviewResponseDto) {
    return this.reviewsService.respond(id, (req as any).user.id, dto);
  }
}
