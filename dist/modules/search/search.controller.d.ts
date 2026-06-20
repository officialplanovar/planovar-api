import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import { SearchEventsDto, SearchListingsDto, SearchVendorsDto } from './dto/search-listings.dto';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    private readonly syncService;
    constructor(searchService: SearchService, syncService: TypesenseSyncService);
    searchListings(dto: SearchListingsDto): Promise<import("./search.service").PaginatedSearchResult<any>>;
    searchVendors(dto: SearchVendorsDto): Promise<import("./search.service").PaginatedSearchResult<any>>;
    searchEvents(dto: SearchEventsDto): Promise<import("./search.service").PaginatedSearchResult<any>>;
    getListingRecommendations(id: string, limit?: string): Promise<any[]>;
    getVendorRecommendations(categoryId: string, limit?: string): Promise<any[]>;
    triggerSync(): Promise<{
        message: string;
    }>;
}
