import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { auth } from './auth.config';

/**
 * OAuth token relay.
 *
 * Social sign-in (Google) establishes a session as a cookie on THIS origin.
 * Mobile/SPA clients authenticate by bearer token, not cookies, and are often
 * cross-origin — so they can't read that cookie. Better Auth is told to use
 * `/oauth/relay?redirect=<appTarget>` as its post-callback `callbackURL`; this
 * endpoint (same origin as the cookie) reads the session token and hands it to
 * the app via the redirect URL. The token value is exactly what the bearer
 * plugin returns as `set-auth-token`, i.e. the session cookie value.
 */
const WEB_ORIGINS = new Set(
  [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    ...(process.env.CORS_ORIGINS ?? '').split(','),
    ...(process.env.TRUSTED_ORIGINS ?? '').split(','),
  ]
    .map((o) => o.trim())
    .filter(Boolean),
);

// Custom URL schemes for the native apps' deep links.
const MOBILE_SCHEMES = ['planovar://', 'planovarvendor://'];

/** Guards against open redirects — only known app targets are allowed. */
function isAllowedRedirect(redirect: string): boolean {
  if (!redirect) return false;
  if (MOBILE_SCHEMES.some((s) => redirect.startsWith(s))) return true;
  try {
    return WEB_ORIGINS.has(new URL(redirect).origin);
  } catch {
    return false;
  }
}

/** Reads the Better Auth session cookie value (raw, matching set-auth-token). */
function readSessionToken(req: Request): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const names = [
    '__Secure-better-auth.session_token',
    'better-auth.session_token',
  ];
  const parts = cookie.split(';').map((c) => c.trim());
  for (const name of names) {
    const prefix = `${name}=`;
    const hit = parts.find((c) => c.startsWith(prefix));
    if (hit) return hit.slice(prefix.length);
  }
  return null;
}

@ApiExcludeController()
@Controller('oauth')
export class OAuthRelayController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Top-level entry point for social sign-in. Initiating OAuth from a
   * cross-origin SPA via XHR fails with `state_mismatch` because the browser
   * won't store Better Auth's SameSite=Lax state cookie from the XHR response.
   * Navigating the browser here (first-party to the API) sets that cookie
   * correctly, then redirects to Google. `intent` (client|vendor) records which
   * app the user signed up through, so the relay can type a brand-new account.
   */
  @Get('start')
  async start(
    @Query('redirect') redirect: string,
    @Query('intent') intent: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!isAllowedRedirect(redirect)) {
      res.status(400).send('Invalid or missing redirect target');
      return;
    }
    const base = process.env.API_BASE_URL ?? 'http://localhost:3000';
    const intentParam =
      intent === 'vendor' || intent === 'client' ? `&intent=${intent}` : '';
    const callbackURL = `${base}/oauth/relay?redirect=${encodeURIComponent(redirect)}${intentParam}`;
    const response = await auth.api.signInSocial({
      body: { provider: 'google', callbackURL },
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });
    // Forward Better Auth's OAuth state/PKCE cookie(s) to the browser.
    const cookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [response.headers.get('set-cookie')].filter(
            (c): c is string => !!c,
          );
    for (const c of cookies) res.append('Set-Cookie', c);
    const data = (await response.json().catch(() => null)) as {
      url?: string;
    } | null;
    if (!data?.url) {
      res.status(502).send('Could not start Google sign-in');
      return;
    }
    res.redirect(data.url);
  }

  @Get('relay')
  async relay(
    @Query('redirect') redirect: string,
    @Query('intent') intent: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!isAllowedRedirect(redirect)) {
      res.status(400).send('Invalid or missing redirect target');
      return;
    }
    // Type a brand-new account by the app it signed up through. Only ever
    // promotes a just-created user to VENDOR — never re-types an existing
    // account, so an established client signing into the vendor app stays a
    // client (and is then blocked by the vendor app's gate).
    if (intent === 'vendor') {
      await this.typeNewVendor(req).catch(() => void 0);
    }
    const token = readSessionToken(req);
    const sep = redirect.includes('?') ? '&' : '?';
    if (!token) {
      res.redirect(`${redirect}${sep}auth_error=nosession`);
      return;
    }
    res.redirect(
      `${redirect}${sep}planovar_token=${encodeURIComponent(token)}`,
    );
  }

  /** Promote a freshly-created OAuth user to VENDOR (vendor-app sign-up). */
  private async typeNewVendor(req: Request): Promise<void> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    const user = session?.user as
      | { id: string; role?: string; createdAt?: string | Date }
      | undefined;
    if (!user || user.role === 'VENDOR') return;
    // Brand-new only: the callback created this user seconds ago.
    const createdMs = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    if (Date.now() - createdMs > 60_000) return;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { role: 'VENDOR' },
    });
  }
}
