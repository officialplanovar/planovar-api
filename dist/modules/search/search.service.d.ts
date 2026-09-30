import { Client } from 'typesense';
import { PrismaService } from '../../prisma/prisma.service';
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
    eventType?: string;
}
export interface VendorFilters {
    subscriptionTier?: string;
    city?: string;
    country?: string;
    isVerified?: boolean;
    eventType?: string;
}
export interface EventFilters {
    clientId?: string;
    city?: string;
}
export declare class SearchService {
    private readonly typesense;
    private readonly prisma;
    constructor(typesense: Client, prisma: PrismaService);
    health(): Promise<{
        status: string;
        reachable: boolean;
        collections: {
            collection: string;
            exists: boolean;
            numDocuments: number;
            missingFields: string[];
            inSync: boolean;
            error?: string;
        }[];
    }>;
    searchListings(query: string, filters: ListingFilters, page?: number, perPage?: number): Promise<PaginatedSearchResult>;
    searchVendors(query: string, filters: VendorFilters, page?: number, perPage?: number): Promise<PaginatedSearchResult>;
    searchEvents(query: string, filters: EventFilters, page?: number, perPage?: number): Promise<PaginatedSearchResult>;
    getListingRecommendations(listingId: string, limit?: number): Promise<any[]>;
    getVendorRecommendations(categoryId: string, limit?: number): Promise<any[]>;
}
