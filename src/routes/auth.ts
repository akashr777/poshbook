import { Hono } from 'hono';

import { authRateLimit, loginRateLimit } from '../middlewares/rateLimit';
import { bruteForceGuard } from '../middlewares/bruteForce';
import { jwtAuth } from '../middlewares/auth/jwtAuth';
import { validateRequest } from '../middlewares/validateRequest';
import { authController } from '../controllers/authController';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from '../validators/auth';
import type { AppVariables } from '../types/app';

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

