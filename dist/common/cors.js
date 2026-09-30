"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorsOrigins = getCorsOrigins;
const DEFAULT_ORIGINS = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
];
function getCorsOrigins() {
    const envOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    return [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];
}
//# sourceMappingURL=cors.js.map