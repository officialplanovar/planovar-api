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
var TypesenseSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseSyncService = void 0;
const common_1 = require("@nestjs/common");
const typesense_1 = require("typesense");
const prisma_service_1 = require("../../prisma/prisma.service");
const typesense_provider_1 = require("./typesense.provider");
const listings_schema_1 = require("./schemas/listings.schema");
const vendors_schema_1 = require("./schemas/vendors.schema");
const events_schema_1 = require("./schemas/events.schema");
let TypesenseSyncService = TypesenseSyncService_1 = class TypesenseSyncService {
    typesense;
    prisma;
    logger = new common_1.Logger(TypesenseSyncService_1.name);
    constructor(typesense, prisma) {
        this.typesense = typesense;
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.ensureCollections();
            this.logger.log('Typesense collections ready');
        }
        catch (err) {
            this.logger.warn('Typesense unavailable at startup — search will fail until it comes online');
        }
    }
    async ensureCollections() {
        for (const schema of [listings_schema_1.listingsSchema, vendors_schema_1.vendorsSchema, events_schema_1.eventsSchema]) {
            try {
                await this.typesense.collections().create(schema);
            }
            catch (err) {
                if (err?.httpStatus !== 409) {
                    console.error(`[Typesense] Failed to create collection ${schema.name}:`, err);
                }
            }
        }
    }
    async indexListing(listing) {
        try {
            const doc = this.transformListing(listing);
            await this.typesense
                .collections(listings_schema_1.LISTINGS_COLLECTION)
                .documents()
                .upsert(doc);
        }
        catch (err) {
            console.error('[Typesense] Failed to index listing:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async deleteListing(id) {
        try {
            await this.typesense
                .collections(listings_schema_1.LISTINGS_COLLECTION)
                .documents(id)
                .delete();
        }
        catch (err) {
            console.error('[Typesense] Failed to delete listing:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async bulkSyncListings() {
        try {
            const listings = await this.prisma.listing.findMany({
                where: { isActive: true },
                include: {
                    vendor: true,
                    media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1 },
                },
            });
            if (listings.length === 0)
                return;
            const docs = listings.map((l) => this.transformListing(l));
            await this.typesense
                .collections(listings_schema_1.LISTINGS_COLLECTION)
                .documents()
                .import(docs, { action: 'upsert' });
        }
        catch (err) {
            console.error('[Typesense] bulkSyncListings failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    transformListing(listing) {
        const vendor = listing.vendor ?? {};
        const locationJson = listing.location;
        let geopoint;
        if (locationJson?.lat != null && locationJson?.lng != null) {
            geopoint = [Number(locationJson.lat), Number(locationJson.lng)];
        }
        const coverImage = listing.media?.[0]?.url ?? undefined;
        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            pricingType: listing.pricingType,
            priceMin: listing.basePrice != null ? Number(listing.basePrice) : undefined,
            priceMax: listing.basePrice != null ? Number(listing.basePrice) : undefined,
            categoryId: listing.categoryId ?? undefined,
            tags: listing.tags ?? [],
            ...(geopoint ? { location: geopoint } : {}),
            city: locationJson?.city ?? undefined,
            country: locationJson?.country ?? undefined,
            vendorId: listing.vendorId,
            vendorName: vendor.businessName ?? '',
            vendorSlug: vendor.slug ?? '',
            vendorTier: vendor.subscriptionTier ?? 'BASIC',
            rating: Number(listing.ratingAvg ?? 0),
            reviewCount: listing.reviewCount ?? 0,
            isActive: listing.isActive,
            isRentable: listing.isRentable ?? false,
            createdAt: new Date(listing.createdAt).getTime(),
            ...(coverImage ? { coverImage } : {}),
        };
    }
    async indexVendor(vendor) {
        try {
            const doc = this.transformVendor(vendor);
            await this.typesense
                .collections(vendors_schema_1.VENDORS_COLLECTION)
                .documents()
                .upsert(doc);
        }
        catch (err) {
            console.error('[Typesense] Failed to index vendor:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async deleteVendor(id) {
        try {
            await this.typesense
                .collections(vendors_schema_1.VENDORS_COLLECTION)
                .documents(id)
                .delete();
        }
        catch (err) {
            console.error('[Typesense] Failed to delete vendor:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async bulkSyncVendors() {
        try {
            const vendors = await this.prisma.vendorProfile.findMany();
            if (vendors.length === 0)
                return;
            const docs = vendors.map((v) => this.transformVendor(v));
            await this.typesense
                .collections(vendors_schema_1.VENDORS_COLLECTION)
                .documents()
                .import(docs, { action: 'upsert' });
        }
        catch (err) {
            console.error('[Typesense] bulkSyncVendors failed:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    transformVendor(vendor) {
        const locationJson = vendor.location;
        let geopoint;
        if (locationJson?.lat != null && locationJson?.lng != null) {
            geopoint = [Number(locationJson.lat), Number(locationJson.lng)];
        }
        return {
            id: vendor.id,
            name: vendor.businessName,
            slug: vendor.slug,
            description: vendor.description ?? undefined,
            tags: vendor.tags ?? [],
            ...(geopoint ? { location: geopoint } : {}),
            city: locationJson?.city ?? undefined,
            country: locationJson?.country ?? undefined,
            ratingAvg: Number(vendor.ratingAvg ?? 0),
            reviewCount: vendor.reviewCount ?? 0,
            subscriptionTier: vendor.subscriptionTier ?? 'BASIC',
            isVerified: vendor.isVerified ?? false,
            createdAt: new Date(vendor.createdAt).getTime(),
        };
    }
    async indexEvent(event) {
        try {
            const doc = this.transformEvent(event);
            await this.typesense
                .collections(events_schema_1.EVENTS_COLLECTION)
                .documents()
                .upsert(doc);
        }
        catch (err) {
            console.error('[Typesense] Failed to index event:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    async deleteEvent(id) {
        try {
            await this.typesense
                .collections(events_schema_1.EVENTS_COLLECTION)
                .documents(id)
                .delete();
        }
        catch (err) {
            console.error('[Typesense] Failed to delete event:', err);
            throw new common_1.ServiceUnavailableException('Search service unavailable');
        }
    }
    transformEvent(event) {
        const locationJson = event.location;
        return {
            id: event.id,
            name: event.name,
            eventDate: event.eventDate ? new Date(event.eventDate).getTime() : undefined,
            budgetMin: event.budgetMin != null ? Number(event.budgetMin) : undefined,
            budgetMax: event.budgetMax != null ? Number(event.budgetMax) : undefined,
            clientId: event.clientId,
            city: locationJson?.city ?? undefined,
            country: locationJson?.country ?? undefined,
            createdAt: new Date(event.createdAt).getTime(),
        };
    }
};
exports.TypesenseSyncService = TypesenseSyncService;
exports.TypesenseSyncService = TypesenseSyncService = TypesenseSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(typesense_provider_1.TYPESENSE_CLIENT)),
    __param(1, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [typesense_1.Client,
        prisma_service_1.PrismaService])
], TypesenseSyncService);
//# sourceMappingURL=typesense-sync.service.js.map