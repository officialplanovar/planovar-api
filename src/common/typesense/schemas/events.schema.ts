import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const EVENTS_COLLECTION = 'events';

export const eventsSchema: CollectionCreateSchema = {
  name: EVENTS_COLLECTION,
  default_sorting_field: 'createdAt',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'eventDate', type: 'int64', optional: true },
    { name: 'budgetMin', type: 'float', optional: true },
    { name: 'budgetMax', type: 'float', optional: true },
    { name: 'clientId', type: 'string' },
    { name: 'city', type: 'string', optional: true, facet: true },
    { name: 'country', type: 'string', optional: true, facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
};
