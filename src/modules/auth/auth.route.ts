import { Hono } from 'hono';

import { authRateLimit, loginRateLimit, bruteForceGuard } from './auth.middleware.js';
import { jwtAuth } from '../../middlewares/auth/jwtAuth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authController } from './auth.controller.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from './auth.schema.js';
import type { AppVariables } from '../../types/app.js';

export const authRouter = new Hono<{ Variables: AppVariables }>();

authRouter.post(
  '/login',
  loginRateLimit,
  bruteForceGuard,
  validateRequest(loginSchema),
  (c) => authController.login(c)
);

authRouter.post('/refresh', authRateLimit, (c) => authController.refresh(c));

authRouter.post('/logout', authRateLimit, (c) => authController.logout(c));

authRouter.post(
  '/forgot-password',
  authRateLimit,
  validateRequest(forgotPasswordSchema),
  (c) => authController.forgotPassword(c)
);

authRouter.post(
  '/reset-password',
  authRateLimit,
  validateRequest(resetPasswordSchema),
  (c) => authController.resetPassword(c)
);

authRouter.post(
  '/change-password',
  jwtAuth,
  validateRequest(changePasswordSchema),
  (c) => authController.changePassword(c)
);
