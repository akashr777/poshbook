import { Hono } from 'hono';

import { rateLimit } from '../../middlewares/rateLimit.js';
import { jwtAuth } from '../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../middlewares/auth/requirePermission.js';
import { Permission } from '../../utils/permissions.js';
import { userController } from './user.controller.js';
import { validateParams, validateRequest } from '../../middlewares/validateRequest.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  usersQuerySchema
} from './user.schema.js';
import type { AppVariables } from '../../types/app.js';

export const usersRouter = new Hono<{ Variables: AppVariables }>();

// 🔐 Global authentication (protects all routes)
usersRouter.use('*', jwtAuth);

// 👤 Get current user
usersRouter.get('/me', requirePermission(Permission.USERS_READ_SELF), (c) => {
  return userController.me(c);
});

// 📋 List users (admin/permission-based)
usersRouter.get(
  '/',
  requirePermission(Permission.USERS_LIST),
  validateRequest(usersQuerySchema, 'query'),
  (c) => {
    return userController.list(c);
  }
);

// ➕ Create user (admin)
usersRouter.post(
  '/',
  requirePermission(Permission.USERS_CREATE),
  rateLimit,
  validateRequest(createUserSchema),
  (c) => {
    return userController.create(c);
  }
);

// ✏️ Update user
usersRouter.put(
  '/:id',
  requirePermission(Permission.USERS_UPDATE),
  validateParams(userIdParamSchema),
  validateRequest(updateUserSchema),
  (c) => {
    return userController.update(c);
  }
);

// ❌ Delete user
usersRouter.delete(
  '/:id',
  requirePermission(Permission.USERS_DELETE),
  validateParams(userIdParamSchema),
  (c) => {
    return userController.remove(c);
  }
);
