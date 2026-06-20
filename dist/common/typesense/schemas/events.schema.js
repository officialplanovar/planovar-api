"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsSchema = exports.EVENTS_COLLECTION = void 0;
exports.EVENTS_COLLECTION = 'events';
exports.eventsSchema = {
    name: exports.EVENTS_COLLECTION,
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
//# sourceMappingURL=events.schema.js.map