import { createMiddleware } from 'hono/factory';
import { env } from '../config/env';
import { fail } from '../utils/responses';
import { getClientKey } from '../utils/request';

type AttemptState = {
  failures: number;
  lockUntil: number;
};

const attempts = new Map<string, AttemptState>();

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const state = attempts.get(key) ?? { failures: 0, lockUntil: 0 };

  state.failures += 1;
  if (state.failures >= env.BRUTE_FORCE_MAX_ATTEMPTS) {
    state.lockUntil = now + env.BRUTE_FORCE_LOCKOUT_SECONDS * 1000;
    state.failures = 0;
  }

  attempts.set(key, state);
}

export function clearFailedLogin(key: string) {
  attempts.delete(key);
}

export function isLoginLocked(key: string) {
  const state = attempts.get(key);
  if (!state) return false;

  if (state.lockUntil > Date.now()) return true;

  if (state.lockUntil > 0 && state.lockUntil <= Date.now()) {
    attempts.delete(key);
  }

  return false;
}

export const bruteForceGuard = createMiddleware(async (c, next) => {
  let email: string | undefined;
  try {
    const body: any = await c.req.raw.clone().json().catch(() => undefined);
    email = typeof body?.email === 'string' ? body.email : undefined;
  } catch {
    email = undefined;
  }

  const key = getClientKey(c, email);
  if (isLoginLocked(key)) {
    return fail(
      c,
      {
        message: 'Too many failed login attempts. Try again later.',
        code: 'ACCOUNT_LOCKED'
      },
      429
    );
  }

  await next();
});
