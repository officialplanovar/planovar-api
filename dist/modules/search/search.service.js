"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typesense_1 = require("typesense");
const prisma_service_1 = require("../../prisma/prisma.service");
const typesense_provider_1 = require("../../common/typesense/typesense.provider");
const listings_schema_1 = require("../../common/typesense/schemas/listings.schema");
const vendors_schema_1 = require("../../common/typesense/schemas/vendors.schema");
const events_schema_1 = require("../../common/typesense/schemas/events.schema");
let SearchService = class SearchService {
    typesense;
    prisma;
    constructor(typesense, prisma) {
        this.typesense = typesense;
        this.prisma = prisma;
    }
    async health() {
        let reachable = false;
        try {
            const h = await this.typesense.health.retrieve();
            reachable = !!h?.ok;
        }
        catch {
            reachable = false;
        }
        const defs = [
            { name: listings_schema_1.LISTINGS_COLLECTION, schema: listings_schema_1.listingsSchema },
            { name: vendors_schema_1.VENDORS_COLLECTION, schema: vendors_schema_1.vendorsSchema },
            { name: events_schema_1.EVENTS_COLLECTION, schema: events_schema_1.eventsSchema },
        ];
        const collections = [];
        if (reachable) {
            for (const def of defs) {
                const codeFields = def.schema.fields.map((f) => f.name);
                try {
                    const live = await this.typesense.collections(def.name).retrieve();
                    const liveFields = new Set((live.fields ?? []).map((f) => f.name));
                    const missingFields = codeFields.filter((n) => !liveFields.has(n));
                    collections.push({
                        collection: def.name,
                        exists: true,
                        numDocuments: live.num_documents ?? 0,
                        missingFields,
                        inSync: missingFields.length === 0,
                    });
                }
                catch (err) {
                    collections.push({
                        collection: def.name,
                        exists: false,
                        numDocuments: 0,
                        missingFields: codeFields,
                        inSync: false,
                        ...(err?.httpStatus && err.httpStatus !== 404
                            ? { error: err?.message ?? String(err) }
                            : {}),
                    });
                }
            }
        }
        const status = !reachable
            ? 'unreachable'
            : collections.every((c) => c.exists && c.inSync)
                ? 'ok'
                : 'degraded';
        return { status, reachable, collections };
    }
    async searchListings(query, filters, page = 1, perPage = 20) {
        try {
            const filterParts = ['isActive:=true', 'vendorVerified:=true'];
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
            }
            else if (filters.minPrice != null) {
                filterParts.push(`priceMin:>=${filters.minPrice}`);
            }
            else if (filters.maxPrice != null) {
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
            if (filters.eventType) {
                filterParts.push(`vendorEventTypes:=[${filters.eventType}]`);
            }
            const hasQuery = !!query && query.trim().length > 0;
            const sortBy = hasQuery
                ? '_text_match:desc,rating:desc'
                : 'rating:desc';
            const runSearch = (parts) => this.typesense
                .collections(listings_schema_1.LISTINGS_COLLECTION)
                .documents()
                .search({
                q: hasQuery ? query : '*',
                query_by: 'title,description,tags',
                filter_by: parts.join(' && '),
                sort_by: sortBy,
                page,
                per_page: perPage,
            });
            let result;
            try {
                result = await runSearch(filterParts);
            }
            catch (err) {
                if (err?.httpStatus === 400 &&
                    /Could not find a filter field/i.test(String(err?.message ?? ''))) {
                    console.warn('[Typesense] listings schema drift — retrying without the vendorVerified filter. Run POST /search/admin/sync to heal.');
                    result = await runSearch(filterParts.filter((p) => !p.startsWith('vendorVerified')));
                }
                else {
                    throw err;
                }
            }
            return {
                page,
                perPage,
                total: result.found,
                hits: (result.hits ?? []).map((h) => h.document),
            };
        }
        catch (err) {
            console.error('[Typesense] searchListings failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async searchVendors(query, filters, page = 1, perPage = 20) {
        try {
            const filterParts = ['isVerified:=true'];
            if (filters.subscriptionTier) {
                filterParts.push(`subscriptionTier:=${filters.subscriptionTier}`);
            }
            if (filters.city) {
                filterParts.push(`city:=${filters.city}`);
            }
            if (filters.country) {
                filterParts.push(`country:=${filters.country}`);
            }
            if (filters.eventType) {
                filterParts.push(`event_types:=[${filters.eventType}]`);
            }
            const hasQuery = !!query && query.trim().length > 0;
            const sortBy = hasQuery
                ? '_text_match:desc,ratingAvg:desc'
                : 'ratingAvg:desc';
            const result = await this.typesense
                .collections(vendors_schema_1.VENDORS_COLLECTION)
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
        }
        catch (err) {
            console.error('[Typesense] searchVendors failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async searchEvents(query, filters, page = 1, perPage = 20) {
        try {
            const filterParts = [];
            if (filters.clientId) {
                filterParts.push(`clientId:=${filters.clientId}`);
            }
            if (filters.city) {
                filterParts.push(`city:=${filters.city}`);
            }
            const hasQuery = !!query && query.trim().length > 0;
            const result = await this.typesense
                .collections(events_schema_1.EVENTS_COLLECTION)
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
        }
        catch (err) {
            console.error('[Typesense] searchEvents failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async getListingRecommendations(listingId, limit = 8) {
        try {
            const listing = await this.prisma.listing.findUnique({
                where: { id: listingId },
                select: { categoryId: true, tags: true, vendorId: true },
            });
            if (!listing)
                return [];
            const filterParts = [
                'isActive:=true',
                'vendorVerified:=true',
                `id:!=${listingId}`,
            ];
            if (listing.categoryId) {
                filterParts.push(`categoryId:=${listing.categoryId}`);
            }
            const hasQuery = listing.tags && listing.tags.length > 0;
            const q = hasQuery ? listing.tags.join(' ') : '*';
            const result = await this.typesense
                .collections(listings_schema_1.LISTINGS_COLLECTION)
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
        }
        catch (err) {
            console.error('[Typesense] getListingRecommendations failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async getVendorRecommendations(categoryId, limit = 8) {
        try {
            const listings = await this.prisma.listing.findMany({
                where: { categoryId, isActive: true },
                select: { vendorId: true },
                distinct: ['vendorId'],
            });
            if (listings.length === 0)
                return [];
            const vendorIds = listings.map((l) => l.vendorId);
            const filterBy = `id:[${vendorIds.join(',')}] && isVerified:=true`;
            const result = await this.typesense
                .collections(vendors_schema_1.VENDORS_COLLECTION)
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
        }
        catch (err) {
            console.error('[Typesense] getVendorRecommendations failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(typesense_provider_1.TYPESENSE_CLIENT)),
    __param(1, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [typesense_1.Client,
        prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map