import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
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
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

class AddMediaDto {
  @ApiProperty({ type: 'string', description: 'Public URL of the media file' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ type: 'string', description: 'Cloud storage public ID for deletion' })
  @IsOptional()
  @IsString()
  publicId?: string;

  @ApiProperty({ enum: MediaType, enumName: 'MediaType', description: 'Media type: IMAGE | VIDEO | AUDIO' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ type: 'number', description: 'Display sort order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(@Inject(ListingsService) private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new listing' })
  create(@Req() req: Request, @Body() dto: CreateListingDto) {
    return this.listingsService.create((req as any).user.id, dto);
  }

  @Get()
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the current vendor's listings" })
  findAll(@Req() req: Request) {
    return this.listingsService.findAllForUser((req as any).user.id);
  }

  @Get('browse')
  @ApiOperation({
    summary:
      'Browse active listings from verified vendors (public, DB-backed — no search dependency)',
  })
  @ApiQuery({ name: 'pricingType', required: false, description: 'e.g. FIXED for products' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'isRentable', required: false, type: 'boolean' })
  @ApiQuery({ name: 'take', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  browse(
    @Query('pricingType') pricingType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isRentable') isRentable?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.listingsService.browse({
      pricingType,
      categoryId,
      isRentable: isRentable == null ? undefined : isRentable === 'true',
      take: take ? parseInt(take, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single listing (public)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post(':id/view')
  @HttpCode(200)
  @ApiOperation({ summary: 'Record a view (increments viewCount, public)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  recordView(@Param('id') id: string) {
    return this.listingsService.recordView(id);
  }

  @Patch(':id')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  update(@Param('id') id: string, @Req() req: Request, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, (req as any).user.id, dto);
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a listing (sets isActive=false)' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.listingsService.remove(id, (req as any).user.id);
  }

  @Post(':id/media')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a media item to a listing' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiBody({ type: AddMediaDto })
  addMedia(@Param('id') id: string, @Req() req: Request, @Body() body: AddMediaDto) {
    return this.listingsService.addMedia(id, (req as any).user.id, {
      url: body.url,
      publicId: body.publicId,
      type: body.type,
      sortOrder: body.sortOrder,
    });
  }

  @Delete(':id/media/:mediaId')
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a media item from a listing — returns publicId for cloud cleanup' })
  @ApiParam({ name: 'id', description: 'Listing UUID' })
  @ApiParam({ name: 'mediaId', description: 'ListingMedia UUID' })
  removeMedia(@Param('mediaId') mediaId: string, @Req() req: Request) {
    return this.listingsService.removeMedia(mediaId, (req as any).user.id);
  }
}
