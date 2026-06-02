import { createMiddleware } from 'hono/factory';
import { env } from '../config/env';
import { fail } from '../utils/responses';
import { getClientKey } from '../utils/request';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function createRateLimiter(windowSeconds: number, maxRequests: number, keyPrefix = '') {
  return createMiddleware(async (c, next) => {
    const key = `${keyPrefix}${getClientKey(c)}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (bucket.count >= maxRequests) {
      return fail(c, { message: 'Too many requests', code: 'RATE_LIMITED' }, 429);
    }

    bucket.count += 1;
    await next();
  });
}

export const rateLimit = createRateLimiter(env.RATE_LIMIT_WINDOW_SECONDS, env.RATE_LIMIT_MAX, 'global:');

export const authRateLimit = createRateLimiter(
  env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
  env.AUTH_RATE_LIMIT_MAX,
  'auth:'
);

export const loginRateLimit = createRateLimiter(
  env.LOGIN_RATE_LIMIT_WINDOW_SECONDS,
  env.LOGIN_RATE_LIMIT_MAX,
  'login:'
);
