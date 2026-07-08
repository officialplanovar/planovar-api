import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import {
  SearchEventsDto,
  SearchListingsDto,
  SearchVendorsDto,
} from './dto/search-listings.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    @Inject(SearchService) private readonly searchService: SearchService,
    @Inject(TypesenseSyncService) private readonly syncService: TypesenseSyncService,
  ) {}

  // ─── Health ────────────────────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({
    summary:
      'Typesense health: reachability + per-collection doc counts and schema drift',
  })
  health() {
    return this.searchService.health();
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  @Get('listings')
  @ApiOperation({ summary: 'Full-text search listings with optional filters' })
  @ApiQuery({ name: 'q', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'perPage', required: false, type: 'number' })
  @ApiQuery({ name: 'categoryId', required: false, type: 'string' })
  @ApiQuery({ name: 'pricingType', required: false, type: 'string' })
  @ApiQuery({ name: 'vendorTier', required: false, type: 'string' })
  @ApiQuery({ name: 'minPrice', required: false, type: 'number' })
  @ApiQuery({ name: 'maxPrice', required: false, type: 'number' })
  @ApiQuery({ name: 'city', required: false, type: 'string' })
  @ApiQuery({ name: 'country', required: false, type: 'string' })
  @ApiQuery({ name: 'isRentable', required: false, type: 'boolean' })
  searchListings(@Query() dto: SearchListingsDto) {
    return this.searchService.searchListings(
      dto.q ?? '',
      {
        categoryId: dto.categoryId,
        pricingType: dto.pricingType,
        vendorTier: dto.vendorTier,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
        city: dto.city,
        country: dto.country,
        isRentable: dto.isRentable,
      },
      dto.page ?? 1,
      dto.perPage ?? 20,
    );
  }

  // ─── Vendors ───────────────────────────────────────────────────────────────

  @Get('vendors')
  @ApiOperation({ summary: 'Full-text search vendors with optional filters' })
  @ApiQuery({ name: 'q', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'perPage', required: false, type: 'number' })
  @ApiQuery({ name: 'subscriptionTier', required: false, type: 'string' })
  @ApiQuery({ name: 'city', required: false, type: 'string' })
  @ApiQuery({ name: 'country', required: false, type: 'string' })
  @ApiQuery({ name: 'isVerified', required: false, type: 'boolean' })
  searchVendors(@Query() dto: SearchVendorsDto) {
    return this.searchService.searchVendors(
      dto.q ?? '',
      {
        subscriptionTier: dto.subscriptionTier,
        city: dto.city,
        country: dto.country,
        isVerified: dto.isVerified,
      },
      dto.page ?? 1,
      dto.perPage ?? 20,
    );
  }

  // ─── Events (Admin only) ───────────────────────────────────────────────────

  @Get('events')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search events — Admin only' })
  @ApiQuery({ name: 'q', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'clientId', required: false, type: 'string' })
  @ApiQuery({ name: 'city', required: false, type: 'string' })
  searchEvents(@Query() dto: SearchEventsDto) {
    return this.searchService.searchEvents(
      dto.q ?? '',
      { clientId: dto.clientId, city: dto.city },
      dto.page ?? 1,
      20,
    );
  }

  // ─── Recommendations ───────────────────────────────────────────────────────

  @Get('listings/:id/recommendations')
  @ApiOperation({ summary: 'Get similar listing recommendations' })
  @ApiParam({ name: 'id', type: 'string', description: 'Listing UUID' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  getListingRecommendations(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 8;
    return this.searchService.getListingRecommendations(id, parsedLimit);
  }

  @Get('vendors/recommendations')
  @ApiOperation({ summary: 'Get top-rated vendor recommendations for a category' })
  @ApiQuery({ name: 'categoryId', required: true, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  getVendorRecommendations(
    @Query('categoryId') categoryId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 8;
    return this.searchService.getVendorRecommendations(categoryId, parsedLimit);
  }

  // ─── Admin Sync ────────────────────────────────────────────────────────────

  @Post('admin/sync')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger bulk re-sync of all listings and vendors into Typesense — Admin only' })
  async triggerSync() {
    await Promise.all([
      this.syncService.bulkSyncListings(),
      this.syncService.bulkSyncVendors(),
    ]);
    return { message: 'Sync completed successfully' };
  }
}
