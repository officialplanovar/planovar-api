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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const typesense_sync_service_1 = require("../../common/typesense/typesense-sync.service");
const search_listings_dto_1 = require("./dto/search-listings.dto");
const search_service_1 = require("./search.service");
let SearchController = class SearchController {
    searchService;
    syncService;
    constructor(searchService, syncService) {
        this.searchService = searchService;
        this.syncService = syncService;
    }
    searchListings(dto) {
        return this.searchService.searchListings(dto.q ?? '', {
            categoryId: dto.categoryId,
            pricingType: dto.pricingType,
            vendorTier: dto.vendorTier,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            city: dto.city,
            country: dto.country,
            isRentable: dto.isRentable,
        }, dto.page ?? 1, dto.perPage ?? 20);
    }
    searchVendors(dto) {
        return this.searchService.searchVendors(dto.q ?? '', {
            subscriptionTier: dto.subscriptionTier,
            city: dto.city,
            country: dto.country,
            isVerified: dto.isVerified,
        }, dto.page ?? 1, dto.perPage ?? 20);
    }
    searchEvents(dto) {
        return this.searchService.searchEvents(dto.q ?? '', { clientId: dto.clientId, city: dto.city }, dto.page ?? 1, 20);
    }
    getListingRecommendations(id, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 8;
        return this.searchService.getListingRecommendations(id, parsedLimit);
    }
    getVendorRecommendations(categoryId, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 8;
        return this.searchService.getVendorRecommendations(categoryId, parsedLimit);
    }
    async triggerSync() {
        await Promise.all([
            this.syncService.bulkSyncListings(),
            this.syncService.bulkSyncVendors(),
        ]);
        return { message: 'Sync completed successfully' };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Full-text search listings with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'perPage', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'pricingType', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'vendorTier', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'isRentable', required: false, type: 'boolean' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_listings_dto_1.SearchListingsDto]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchListings", null);
__decorate([
    (0, common_1.Get)('vendors'),
    (0, swagger_1.ApiOperation)({ summary: 'Full-text search vendors with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'perPage', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'subscriptionTier', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'isVerified', required: false, type: 'boolean' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_listings_dto_1.SearchVendorsDto]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchVendors", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Search events — Admin only' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, type: 'string' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_listings_dto_1.SearchEventsDto]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchEvents", null);
__decorate([
    (0, common_1.Get)('listings/:id/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar listing recommendations' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Listing UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "getListingRecommendations", null);
__decorate([
    (0, common_1.Get)('vendors/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top-rated vendor recommendations for a category' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: true, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number' }),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "getVendorRecommendations", null);
__decorate([
    (0, common_1.Post)('admin/sync'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger bulk re-sync of all listings and vendors into Typesense — Admin only' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "triggerSync", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('Search'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('search'),
    __param(0, (0, common_1.Inject)(search_service_1.SearchService)),
    __param(1, (0, common_1.Inject)(typesense_sync_service_1.TypesenseSyncService)),
    __metadata("design:paramtypes", [search_service_1.SearchService,
        typesense_sync_service_1.TypesenseSyncService])
], SearchController);
//# sourceMappingURL=search.controller.js.map