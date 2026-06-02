import type { Context } from 'hono';
import { userService } from './user.service.js';
import { fail, ok } from '../../utils/responses.js';
import { auditFromContext } from '../audit/index.js';
import type { AppVariables } from '../../types/app.js';
import type {
  UserCreateInput,
  UserUpdateInput,
  UsersQueryInput
} from './user.types.js';

type UsersContext = Context<{ Variables: AppVariables }>;

export const userController = {
  async me(c: UsersContext) {
    const authUser = c.get('user');
    const userId = Number(authUser.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return fail(c, { message: 'Invalid token subject', code: 'INVALID_TOKEN' }, 401);
    }

    const user = await userService.findById(userId);
    if (!user) {
      return fail(c, { message: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    return ok(c, { user });
  },

  async list(c: UsersContext) {
    const query = c.req.validated as UsersQueryInput;
    const result = await userService.list(query);
    return ok(c, result);
  },

  async create(c: UsersContext) {
    const input = c.req.validated as UserCreateInput;
    const authUser = c.get('user');

    try {
      const user = await userService.create(input);

      await auditFromContext(c, {
        action: 'users.created',
        actorUserId: Number(authUser.id),
        targetUserId: user.id,
        metadata: { email: user.email, role: user.role }
      });

      return ok(c, { user }, 201);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'EMAIL_EXISTS') {
        return fail(c, { message: 'Email already in use', code: 'EMAIL_EXISTS' }, 409);
      }
      if (code === 'EMAIL_SEND_FAILED') {
        return fail(c, { message: 'User was not created because welcome email failed', code: 'EMAIL_SEND_FAILED' }, 502);
      }
      throw err;
    }
  },

  async update(c: UsersContext) {
    const { id } = c.req.validatedParams as { id: number };
    const input = c.req.validated as UserUpdateInput;
    const authUser = c.get('user');

    const user = await userService.update(id, input);
    if (!user) {
      return fail(c, { message: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    await auditFromContext(c, {
      action: 'users.updated',
      actorUserId: Number(authUser.id),
      targetUserId: id,
      metadata: { fields: Object.keys(input) }
    });

    return ok(c, { user });
  },

  async remove(c: UsersContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');

    if (String(id) === authUser.id) {
      return fail(c, { message: 'Cannot delete your own account', code: 'FORBIDDEN' }, 403);
    }

    const deleted = await userService.remove(id);
    if (!deleted) {
      return fail(c, { message: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    await auditFromContext(c, {
      action: 'users.deleted',
      actorUserId: Number(authUser.id),
      targetUserId: id
    });

    return ok(c, { deleted: true });
  }
};
export type UserController = typeof userController;
