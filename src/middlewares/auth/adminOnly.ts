import { createMiddleware } from 'hono/factory';
import { fail } from '../../utils/responses';
import type { AppVariables } from '../../types/app';

export const adminOnly = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return fail(c, { message: 'Admin only', code: 'FORBIDDEN' }, 403);
  }

  await next();
});
