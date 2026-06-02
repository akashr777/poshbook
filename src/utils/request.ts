import type { Context } from 'hono';

export function getClientKey(c: Context, email?: string) {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('cf-connecting-ip') ||
    'unknown';

  return email ? `${ip}:${email.toLowerCase()}` : ip;
}
