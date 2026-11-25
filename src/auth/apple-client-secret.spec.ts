import {
  createPublicKey,
  generateKeyPairSync,
  verify as cryptoVerify,
} from 'crypto';
import { resolveAppleClientSecret } from './apple-client-secret';

/**
 * Guards the Sign in with Apple client-secret minting. The ES256 / IEEE-P1363
 * signature encoding is the subtle part: Node emits DER by default, which Apple
 * rejects, so a regression here would silently break Apple sign-in in prod.
 */
describe('resolveAppleClientSecret', () => {
  const APPLE_ENV = [
    'APPLE_CLIENT_SECRET',
    'APPLE_TEAM_ID',
    'APPLE_KEY_ID',
    'APPLE_SERVICE_ID',
    'APPLE_PRIVATE_KEY',
  ];
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = {};
    for (const k of APPLE_ENV) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of APPLE_ENV) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  function freshKeyPair() {
    return generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
  }

  function decodeSegment(seg: string): Record<string, unknown> {
    return JSON.parse(
      Buffer.from(
        seg.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString(),
    );
  }

  it('returns null when nothing is configured', () => {
    expect(resolveAppleClientSecret()).toBeNull();
  });

  it('prefers an explicit APPLE_CLIENT_SECRET verbatim', () => {
    process.env.APPLE_CLIENT_SECRET = 'pre.generated.jwt';
    // Signing inputs present too — explicit value must still win.
    const { privateKey } = freshKeyPair();
    process.env.APPLE_TEAM_ID = 'TEAM123456';
    process.env.APPLE_KEY_ID = 'KEY7654321';
    process.env.APPLE_SERVICE_ID = 'ng.planovar.signin';
    process.env.APPLE_PRIVATE_KEY = privateKey;
    expect(resolveAppleClientSecret()).toBe('pre.generated.jwt');
  });

  it('returns null when the signing key is incomplete', () => {
    process.env.APPLE_TEAM_ID = 'TEAM123456';
    process.env.APPLE_KEY_ID = 'KEY7654321';
    // APPLE_SERVICE_ID and APPLE_PRIVATE_KEY missing.
    expect(resolveAppleClientSecret()).toBeNull();
  });

  it('returns null for a malformed private key instead of throwing', () => {
    process.env.APPLE_TEAM_ID = 'TEAM123456';
    process.env.APPLE_KEY_ID = 'KEY7654321';
    process.env.APPLE_SERVICE_ID = 'ng.planovar.signin';
    process.env.APPLE_PRIVATE_KEY = 'not-a-real-pem-key';
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(resolveAppleClientSecret()).toBeNull();
    spy.mockRestore();
  });

  it('mints a valid ES256 JWT with Apple claims from the signing key', () => {
    const { privateKey, publicKey } = freshKeyPair();
    process.env.APPLE_TEAM_ID = 'TEAM123456';
    process.env.APPLE_KEY_ID = 'KEY7654321';
    process.env.APPLE_SERVICE_ID = 'ng.planovar.signin';
    // Simulate a Railway-style value with literal "\n" sequences.
    process.env.APPLE_PRIVATE_KEY = privateKey.replace(/\n/g, '\\n');

    const jwt = resolveAppleClientSecret();
    expect(jwt).not.toBeNull();
    const parts = jwt!.split('.');
    expect(parts).toHaveLength(3);

    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    expect(header).toMatchObject({ alg: 'ES256', kid: 'KEY7654321', typ: 'JWT' });
    expect(payload).toMatchObject({
      iss: 'TEAM123456',
      sub: 'ng.planovar.signin',
      aud: 'https://appleid.apple.com',
    });
    // Apple caps the client-secret lifetime at 6 months.
    expect((payload.exp as number) - (payload.iat as number)).toBeLessThanOrEqual(
      60 * 60 * 24 * 183,
    );

    const sig = Buffer.from(
      parts[2].replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    );
    const verified = cryptoVerify(
      'sha256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      { key: createPublicKey(publicKey), dsaEncoding: 'ieee-p1363' },
      sig,
    );
    expect(verified).toBe(true);
  });
});
