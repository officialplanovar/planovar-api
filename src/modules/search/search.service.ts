import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Client } from 'typesense';
import { PrismaService } from '../../prisma/prisma.service';
import { TYPESENSE_CLIENT } from '../../common/typesense/typesense.provider';
import {
  LISTINGS_COLLECTION,
} from '../../common/typesense/schemas/listings.schema';
import {
  VENDORS_COLLECTION,
} from '../../common/typesense/schemas/vendors.schema';
import {
  EVENTS_COLLECTION,
} from '../../common/typesense/schemas/events.schema';

export interface PaginatedSearchResult<T = any> {
  page: number;
  perPage: number;
  total: number;
  hits: T[];
}

export interface ListingFilters {
  categoryId?: string;
  pricingType?: string;
  vendorTier?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  country?: string;
  isRentable?: boolean;
}

export interface VendorFilters {
  subscriptionTier?: string;
  city?: string;
  country?: string;
  isVerified?: boolean;
}

export interface EventFilters {
  clientId?: string;
  city?: string;
}

@Injectable()
export class SearchService {
  constructor(
    @Inject(TYPESENSE_CLIENT) private readonly typesense: Client,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  // ─── Listings ──────────────────────────────────────────────────────────────

  async searchListings(
    query: string,
    filters: ListingFilters,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedSearchResult> {
    try {
      const filterParts: string[] = ['isActive:=true'];

      if (filters.categoryId) {
        filterParts.push(`categoryId:=${filters.categoryId}`);
      }
      if (filters.pricingType) {
        filterParts.push(`pricingType:=${filters.pricingType}`);
      }
      if (filters.vendorTier) {
        filterParts.push(`vendorTier:=${filters.vendorTier}`);
      }
      if (filters.minPrice != null && filters.maxPrice != null) {
        filterParts.push(`priceMin:>=${filters.minPrice} && priceMax:<=${filters.maxPrice}`);
      } else if (filters.minPrice != null) {
        filterParts.push(`priceMin:>=${filters.minPrice}`);
      } else if (filters.maxPrice != null) {
        filterParts.push(`priceMax:<=${filters.maxPrice}`);
      }
      if (filters.city) {
        filterParts.push(`city:=${filters.city}`);
      }
      if (filters.country) {
        filterParts.push(`country:=${filters.country}`);
      }
      if (filters.isRentable != null) {
        filterParts.push(`isRentable:=${filters.isRentable}`);
      }

      const hasQuery = !!query && query.trim().length > 0;
      const sortBy = hasQuery
        ? '_text_match:desc,rating:desc'
        : 'rating:desc';

      const result = await this.typesense
        .collections(LISTINGS_COLLECTION)
        .documents()
        .search({
          q: hasQuery ? query : '*',
          query_by: 'title,description,tags',
          filter_by: filterParts.join(' && '),
          sort_by: sortBy,
          page,
          per_page: perPage,
        });

      return {
        page,
        perPage,
        total: result.found,
        hits: (result.hits ?? []).map((h) => h.document),
      };
    } catch (err) {
      console.error('[Typesense] searchListings failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  // ─── Vendors ───────────────────────────────────────────────────────────────

  async searchVendors(
    query: string,
    filters: VendorFilters,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedSearchResult> {
    try {
      const filterParts: string[] = [];

      if (filters.subscriptionTier) {
        filterParts.push(`subscriptionTier:=${filters.subscriptionTier}`);
      }
      if (filters.city) {
        filterParts.push(`city:=${filters.city}`);
      }
      if (filters.country) {
        filterParts.push(`country:=${filters.country}`);
      }
      if (filters.isVerified != null) {
        filterParts.push(`isVerified:=${filters.isVerified}`);
      }

      const hasQuery = !!query && query.trim().length > 0;
      const sortBy = hasQuery
        ? '_text_match:desc,ratingAvg:desc'
        : 'ratingAvg:desc';

      const result = await this.typesense
        .collections(VENDORS_COLLECTION)
        .documents()
        .search({
          q: hasQuery ? query : '*',
          query_by: 'name,description,tags',
          ...(filterParts.length > 0 ? { filter_by: filterParts.join(' && ') } : {}),
          sort_by: sortBy,
          page,
          per_page: perPage,
        });

      return {
        page,
        perPage,
        total: result.found,
        hits: (result.hits ?? []).map((h) => h.document),
      };
    } catch (err) {
      console.error('[Typesense] searchVendors failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  // ─── Events (admin only) ───────────────────────────────────────────────────

  async searchEvents(
    query: string,
    filters: EventFilters,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedSearchResult> {
    try {
      const filterParts: string[] = [];

      if (filters.clientId) {
        filterParts.push(`clientId:=${filters.clientId}`);
      }
      if (filters.city) {
        filterParts.push(`city:=${filters.city}`);
      }

      const hasQuery = !!query && query.trim().length > 0;

      const result = await this.typesense
        .collections(EVENTS_COLLECTION)
        .documents()
        .search({
          q: hasQuery ? query : '*',
          query_by: 'name',
          ...(filterParts.length > 0 ? { filter_by: filterParts.join(' && ') } : {}),
          sort_by: 'createdAt:desc',
          page,
          per_page: perPage,
        });

      return {
        page,
        perPage,
        total: result.found,
        hits: (result.hits ?? []).map((h) => h.document),
      };
    } catch (err) {
      console.error('[Typesense] searchEvents failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  // ─── Recommendations ───────────────────────────────────────────────────────

  async getListingRecommendations(
    listingId: string,
    limit = 8,
  ): Promise<any[]> {
    try {
      const listing = await this.prisma.listing.findUnique({
        where: { id: listingId },
        select: { categoryId: true, tags: true, vendorId: true },
      });

      if (!listing) return [];

      const filterParts: string[] = [
        'isActive:=true',
        `id:!=${listingId}`,
      ];

      if (listing.categoryId) {
        filterParts.push(`categoryId:=${listing.categoryId}`);
      }

      const hasQuery = listing.tags && listing.tags.length > 0;
      const q = hasQuery ? listing.tags!.join(' ') : '*';

      const result = await this.typesense
        .collections(LISTINGS_COLLECTION)
        .documents()
        .search({
          q,
          query_by: 'tags,title',
          filter_by: filterParts.join(' && '),
          sort_by: '_text_match:desc,rating:desc',
          per_page: limit,
          page: 1,
        });

      return (result.hits ?? []).map((h) => h.document);
    } catch (err) {
      console.error('[Typesense] getListingRecommendations failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async getVendorRecommendations(
    categoryId: string,
    limit = 8,
  ): Promise<any[]> {
    try {
      // Find vendor IDs that have active listings in this category
      const listings = await this.prisma.listing.findMany({
        where: { categoryId, isActive: true },
        select: { vendorId: true },
        distinct: ['vendorId'],
      });

      if (listings.length === 0) return [];

      const vendorIds = listings.map((l) => l.vendorId);
      const filterBy = `id:[${vendorIds.join(',')}]`;

      const result = await this.typesense
        .collections(VENDORS_COLLECTION)
        .documents()
        .search({
          q: '*',
          query_by: 'name',
          filter_by: filterBy,
          sort_by: 'ratingAvg:desc',
          per_page: limit,
          page: 1,
        });

      return (result.hits ?? []).map((h) => h.document);
    } catch (err) {
      console.error('[Typesense] getVendorRecommendations failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }
}
