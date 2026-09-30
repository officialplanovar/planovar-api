/**
 * Single source of truth for allowed browser origins.
 *
 * Used by both the HTTP CORS config (main.ts) and the Socket.IO gateway so the
 * WebSocket surface isn't a wildcard while HTTP is locked down. Extra origins
 * (staging/prod) are supplied via the CORS_ORIGINS env var (comma-separated).
 */
const DEFAULT_ORIGINS = [
  'http://localhost:3001', // Flutter client web (dev)
  'http://localhost:3002', // Flutter vendor web (dev)
  'http://localhost:3003', // Admin console (dev, default Next port)
  'http://localhost:3004', // Admin console (dev, documented port)
];

export function getCorsOrigins(): string[] {
  const envOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];
}
