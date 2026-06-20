import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const VENDORS_COLLECTION = 'vendors';

export const vendorsSchema: CollectionCreateSchema = {
  name: VENDORS_COLLECTION,
  enable_nested_fields: true,
  default_sorting_field: 'ratingAvg',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'tags', type: 'string[]', optional: true },
    { name: 'location', type: 'geopoint', optional: true },
    { name: 'city', type: 'string', optional: true, facet: true },
    { name: 'country', type: 'string', optional: true, facet: true },
    { name: 'ratingAvg', type: 'float' },
    { name: 'reviewCount', type: 'int32' },
    { name: 'subscriptionTier', type: 'string', facet: true },
    { name: 'isVerified', type: 'bool' },
    { name: 'createdAt', type: 'int64' },
  ],
};
