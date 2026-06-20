"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingsSchema = exports.LISTINGS_COLLECTION = void 0;
exports.LISTINGS_COLLECTION = 'listings';
exports.listingsSchema = {
    name: exports.LISTINGS_COLLECTION,
    enable_nested_fields: true,
    default_sorting_field: 'rating',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'pricingType', type: 'string' },
        { name: 'priceMin', type: 'float', optional: true },
        { name: 'priceMax', type: 'float', optional: true },
        { name: 'categoryId', type: 'string', optional: true },
        { name: 'tags', type: 'string[]', optional: true },
        { name: 'location', type: 'geopoint', optional: true },
        { name: 'city', type: 'string', optional: true, facet: true },
        { name: 'country', type: 'string', optional: true, facet: true },
        { name: 'vendorId', type: 'string' },
        { name: 'vendorName', type: 'string' },
        { name: 'vendorSlug', type: 'string' },
        { name: 'vendorTier', type: 'string', facet: true },
        { name: 'rating', type: 'float' },
        { name: 'reviewCount', type: 'int32' },
        { name: 'isActive', type: 'bool' },
        { name: 'isRentable', type: 'bool', optional: true },
        { name: 'createdAt', type: 'int64' },
        { name: 'coverImage', type: 'string', optional: true },
    ],
};
//# sourceMappingURL=listings.schema.js.map