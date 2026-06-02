import type { Context } from 'hono';
import { authService } from './auth.service';
import { userService, toPublicUser } from '../users';
import { fail, ok } from '../../utils/responses';
import { setRefreshCookie, clearRefreshCookie, getRefreshTokenFromCookie } from '../../utils/cookies';
import { auditFromContext } from '../audit';
import { getClientKey } from '../../utils/request';
import { recordFailedLogin, clearFailedLogin } from './auth.middleware';
import type { AppVariables } from '../../types/app';
import type {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from './auth.schema';
import type { z } from 'zod';

type LoginInput = z.infer<typeof loginSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
type AuthContext = Context<{ Variables: AppVariables }>;

export const authController = {
  async login(c: Context) {
    const { email, password } = c.req.validated as LoginInput;
    const clientKey = getClientKey(c, email);

    const user = await authService.verifyUserLogin(email, password);
    if (!user) {
      recordFailedLogin(clientKey);
      await auditFromContext(c, {
        action: 'auth.login.failed',
        metadata: { email }
      });
      return fail(c, { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401);
    }

    clearFailedLogin(clientKey);

    const tokens = await authService.issueTokenPair({
      id: String(user.id),
      email: user.email,
      role: user.role as 'admin' | 'user'
    });

    setRefreshCookie(c, tokens.refreshToken);

    await auditFromContext(c, {
      action: 'auth.login.success',
      actorUserId: user.id,
      targetUserId: user.id
    });

    return ok(c, {
      user: toPublicUser(user),
      accessToken: tokens.accessToken
    });
  },

  async refresh(c: Context) {
    const refreshToken = getRefreshTokenFromCookie(c);
    if (!refreshToken) {
      return fail(c, { message: 'Missing refresh token cookie', code: 'MISSING_REFRESH_TOKEN' }, 401);
    }

    const rotated = await authService.rotateRefreshToken(refreshToken);
    if (!rotated) {
      clearRefreshCookie(c);
      return fail(c, { message: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' }, 401);
    }

    const payload = await authService.verifyRefreshToken(rotated.refreshToken);
    if (!payload) {
      clearRefreshCookie(c);
      return fail(c, { message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' }, 401);
    }

    const user = await userService.findById(Number(payload.sub));
    if (!user) {
      clearRefreshCookie(c);
      return fail(c, { message: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    setRefreshCookie(c, rotated.refreshToken);

    await auditFromContext(c, {
      action: 'auth.refresh',
      actorUserId: user.id,
      targetUserId: user.id
    });

    return ok(c, {
      user,
      accessToken: rotated.accessToken
    });
  },

  async logout(c: Context) {
    const refreshToken = getRefreshTokenFromCookie(c);
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    clearRefreshCookie(c);

    await auditFromContext(c, { action: 'auth.logout' });

    return ok(c, { loggedOut: true });
  },

  async forgotPassword(c: Context) {
    const { email } = c.req.validated as ForgotPasswordInput;

    try {
      const result = await authService.requestReset(email);
      if (result.sent) {
        await auditFromContext(c, {
          action: 'auth.password.reset.requested',
          targetUserId: result.userId,
          metadata: { email }
        });
      }
    } catch {
      // Avoid email enumeration — always return generic success.
    }

    return ok(c, {
      message: 'If the email exists, a password reset link has been sent.'
    });
  },

  async resetPassword(c: Context) {
    const { token, password } = c.req.validated as ResetPasswordInput;

    const result = await authService.resetPassword(token, password);
    if (!result.ok) {
      return fail(c, { message: 'Invalid or expired reset token', code: 'INVALID_RESET_TOKEN' }, 400);
    }

    await auditFromContext(c, {
      action: 'auth.password.reset.completed',
      targetUserId: result.userId
    });

    return ok(c, { message: 'Password has been reset successfully' });
  },

  async changePassword(c: AuthContext) {
    const { currentPassword, newPassword } = c.req.validated as ChangePasswordInput;
    const authUser = c.get('user');
    const userId = Number(authUser.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return fail(c, { message: 'Invalid token subject', code: 'INVALID_TOKEN' }, 401);
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    if (!result.ok) {
      if (result.reason === 'INVALID_CURRENT_PASSWORD') {
        return fail(c, { message: 'Current password is incorrect', code: 'INVALID_CURRENT_PASSWORD' }, 400);
      }
      return fail(c, { message: 'User not found', code: 'USER_NOT_FOUND' }, 404);
    }

    clearRefreshCookie(c);

    await auditFromContext(c, {
      action: 'auth.password.changed',
      actorUserId: userId,
      targetUserId: userId
    });

    return ok(c, { message: 'Password changed successfully. Please sign in again.' });
  }
};
