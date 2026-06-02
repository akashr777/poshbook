import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import { env } from '../../config/env';
import { fail } from '../../utils/responses';
import type { AppVariables, AuthUser, UserRole } from '../../types/app';

export const jwtAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const auth = c.req.header('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return fail(c, { message: 'Missing Bearer token', code: 'UNAUTHORIZED' }, 401);
  }

  const token = auth.slice('Bearer '.length);
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: env.JWT_ACCESS_ISSUER,
      audience: env.JWT_ACCESS_AUDIENCE
    });

    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      return fail(c, { message: 'Invalid access token', code: 'INVALID_TOKEN' }, 401);
    }

    if (payload.role !== 'admin' && payload.role !== 'user') {
      return fail(c, { message: 'Invalid access token role', code: 'INVALID_TOKEN' }, 401);
    }

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole
    };

    c.set('user', user);
    await next();
  } catch {
    return fail(c, { message: 'Invalid or expired access token', code: 'INVALID_TOKEN' }, 401);
  }
});
