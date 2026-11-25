import { createPrivateKey, sign } from 'crypto';

/**
 * Resolves the "Sign in with Apple" client secret.
 *
 * Apple's OAuth client secret is not a static string: it is a short-lived
 * ES256-signed JWT (max 6-month lifetime) derived from the team's private key.
 * Two modes are supported, in priority order:
 *
 *  1. Explicit — set `APPLE_CLIENT_SECRET` to a pre-generated JWT. Simple, but
 *     it silently expires within 6 months and must be rotated by hand, which is
 *     an easy way to wake up to a broken "Sign in with Apple" in production.
 *
 *  2. Auto (recommended) — provide the signing inputs and let the server mint
 *     the secret at boot: `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
 *     (the .p8 contents) and `APPLE_SERVICE_ID`. Regenerated on every process
 *     start, so a routine redeploy also refreshes it — no manual rotation.
 *
 * Returns `null` when neither mode is fully configured (Apple sign-in then stays
 * disabled, exactly like Google without its client id). All crypto failures are
 * swallowed to a logged error + `null` so a malformed key disables the provider
 * rather than crashing the whole API at boot.
 *
 * NOTE: the signing key here is the *Sign in with Apple* key — distinct from the
 * App Store Server API key used for IAP (`APPLE_IAP_*`). They are different keys
 * in the Apple Developer portal and must not be swapped.
 */
export function resolveAppleClientSecret(): string | null {
  const explicit = process.env.APPLE_CLIENT_SECRET?.trim();
  if (explicit) return explicit;

  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const serviceId = process.env.APPLE_SERVICE_ID?.trim();
  const rawKey = process.env.APPLE_PRIVATE_KEY;
  if (!teamId || !keyId || !serviceId || !rawKey) return null;

  // Env dashboards (Railway, etc.) commonly store the multi-line .p8 with
  // literal "\n" sequences — restore real newlines so the PEM parses.
  const pem = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

  let privateKey;
  try {
    privateKey = createPrivateKey({ key: pem, format: 'pem' });
  } catch (err) {
    console.error(
      '[AppleAuth] APPLE_PRIVATE_KEY is not a valid PEM key — Apple sign-in disabled:',
      err,
    );
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  // Apple caps the client-secret lifetime at 6 months. Use just under that
  // (150 days) so a long-running process keeps a valid secret, while each
  // redeploy mints a fresh one.
  const exp = now + 60 * 60 * 24 * 150;

  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = {
    iss: teamId,
    iat: now,
    exp,
    aud: 'https://appleid.apple.com',
    sub: serviceId,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;

  try {
    // ES256 for JOSE requires the raw r||s signature (IEEE P1363), not the
    // default DER encoding Node emits for EC keys.
    const signature = sign('sha256', Buffer.from(signingInput), {
      key: privateKey,
      dsaEncoding: 'ieee-p1363',
    });
    return `${signingInput}.${base64url(signature)}`;
  } catch (err) {
    console.error(
      '[AppleAuth] Failed to sign Apple client secret — Apple sign-in disabled:',
      err,
    );
    return null;
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
