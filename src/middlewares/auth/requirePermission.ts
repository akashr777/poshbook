import { createMiddleware } from 'hono/factory';
import { fail } from '../../utils/responses';
import { roleHasPermission, type Permission } from '../../utils/permissions';
import type { AppVariables } from '../../types/app';

export function requirePermission(permission: Permission) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return fail(c, { message: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }

    if (!roleHasPermission(user.role, permission)) {
      return fail(c, { message: 'Forbidden', code: 'FORBIDDEN' }, 403);
    }

    await next();
  });
}
