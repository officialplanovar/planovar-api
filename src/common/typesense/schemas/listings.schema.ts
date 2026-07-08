import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const LISTINGS_COLLECTION = 'listings';

export const listingsSchema: CollectionCreateSchema = {
  name: LISTINGS_COLLECTION,
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
    { name: 'vendorVerified', type: 'bool', optional: true },
    { name: 'rating', type: 'float' },
    { name: 'reviewCount', type: 'int32' },
    { name: 'isActive', type: 'bool' },
    { name: 'isRentable', type: 'bool', optional: true },
    { name: 'createdAt', type: 'int64' },
    { name: 'coverImage', type: 'string', optional: true },
  ],
};
