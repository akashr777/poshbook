import type { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { env } from '../config/env';

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'Strict' as const,
  path: '/api/auth',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {})
});

export function setRefreshCookie(c: Context, refreshToken: string) {
  setCookie(c, env.COOKIE_REFRESH_NAME, refreshToken, {
    ...baseCookieOptions(),
    maxAge: env.JWT_REFRESH_TTL_SECONDS
  });
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, env.COOKIE_REFRESH_NAME, baseCookieOptions());
}

export function getRefreshTokenFromCookie(c: Context): string | undefined {
  return getCookie(c, env.COOKIE_REFRESH_NAME);
}
