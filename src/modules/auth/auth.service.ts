import { SignJWT, jwtVerify } from 'jose';
import { randomUUID, createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import { sessionService } from '../sessions';
import { userRepository } from '../users';
import { emailService } from '../../services/emailService';
import type { UserRole } from '../../types/app';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types';

function accessSecret() {
  return new TextEncoder().encode(env.JWT_ACCESS_SECRET);
}

function refreshSecret() {
  return new TextEncoder().encode(env.JWT_REFRESH_SECRET);
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export const passwordUtility = {
  async generateSecureRandomPassword(length = 18): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil((length * 3) / 4)));
    const b64 = Buffer.from(bytes).toString('base64');
    const sanitized = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return sanitized.slice(0, length);
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
};

export const authService = {
  // Passwords Delegators for users module or auth internally
  async generateSecureRandomPassword(length = 18): Promise<string> {
    return passwordUtility.generateSecureRandomPassword(length);
  },

  async hashPassword(password: string): Promise<string> {
    return passwordUtility.hashPassword(password);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return passwordUtility.comparePassword(password, hash);
  },

  // Auth Operations
  async verifyUserLogin(email: string, password: string) {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    try {
      const user = await userRepository.findByEmail(email);

      console.log('User found:', !!user);

      if (!user) {
        console.log('FAILED: No user found with email:', email);
        return null;
      }

      console.log('User ID:', user.id);
      console.log('User status:', user.status);
      console.log('User role:', user.role);
      console.log('Stored password hash (first 20 chars):', user.password?.substring(0, 20) + '...');

      if (user.status.toLowerCase() !== 'active') {
        console.log('FAILED: User status is not active:', user.status);
        return null;
      }

      const ok = await passwordUtility.comparePassword(password, user.password);
      console.log('Password match result:', ok);

      if (!ok) {
        console.log('FAILED: Password does not match');
        console.log('Input password:', password);
        console.log('Full stored hash:', user.password);
        return null;
      }

      console.log('SUCCESS: Login verified');
      console.log('=== LOGIN ATTEMPT END ===');
      return user;
    } catch (error) {
      console.error('ERROR in verifyUserLogin:', error);
      throw error;
    }
  },

  async createAccessToken(payload: { id: string; email: string; role: UserRole }): Promise<string> {
    console.log('Creating access token for:', payload.email);
    return new SignJWT({ email: payload.email, role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.id)
      .setIssuer(env.JWT_ACCESS_ISSUER)
      .setAudience(env.JWT_ACCESS_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + env.JWT_ACCESS_TTL_SECONDS)
      .sign(accessSecret());
  },

  async createRefreshToken(payload: { id: string; email: string; role: UserRole }): Promise<string> {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000);

    await sessionService.createSession(jti, Number(payload.id), expiresAt);

    const token = await new SignJWT({ email: payload.email, role: payload.role, jti })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.id)
      .setJti(jti)
      .setIssuer(env.JWT_REFRESH_ISSUER)
      .setAudience(env.JWT_REFRESH_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(refreshSecret());

    return token;
  },

  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(refreshToken, refreshSecret(), {
        issuer: env.JWT_REFRESH_ISSUER,
        audience: env.JWT_REFRESH_AUDIENCE
      });

      const jti = (payload.jti as string) || (payload as { jti?: string }).jti;
      if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string' || !jti) {
        return null;
      }

      if (payload.role !== 'admin' && payload.role !== 'user') {
        return null;
      }

      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        jti
      };
    } catch {
      return null;
    }
  },

  async issueTokenPair(payload: { id: string; email: string; role: UserRole }) {
    console.log('Issuing token pair for:', payload.email);
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken(payload)
    ]);

    return { accessToken, refreshToken };
  },

  async rotateRefreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return null;

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId < 1) return null;

    const sessionActive = await sessionService.isSessionActive(payload.jti, userId);
    if (!sessionActive) return null;

    const active = await userRepository.isActive(userId);
    if (!active) {
      await sessionService.revokeSession(payload.jti);
      return null;
    }

    await sessionService.revokeSession(payload.jti);

    return this.issueTokenPair({
      id: payload.sub,
      email: payload.email,
      role: payload.role
    });
  },

  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return false;
    await sessionService.revokeSession(payload.jti);
    return true;
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) return { ok: false as const, reason: 'USER_NOT_FOUND' as const };

    const valid = await passwordUtility.comparePassword(currentPassword, user.password);
    if (!valid) return { ok: false as const, reason: 'INVALID_CURRENT_PASSWORD' as const };

    const hashed = await passwordUtility.hashPassword(newPassword);
    await authRepository.updateUserPassword(userId, hashed);
    await sessionService.revokeAllForUser(userId);

    return { ok: true as const };
  },

  // Password Reset Workflows
  async requestReset(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.status !== 'active') {
      return { sent: false };
    }

    await authRepository.deactivateOlderResetTokens(user.id);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_SECONDS * 1000);

    await authRepository.insertResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl, env.PASSWORD_RESET_TTL_SECONDS);

    return { sent: true, userId: user.id };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const record = await authRepository.findActiveResetToken(tokenHash);

    if (!record) {
      return { ok: false as const, reason: 'INVALID_TOKEN' as const };
    }

    const hashed = await passwordUtility.hashPassword(newPassword);

    await authRepository.executePasswordReset(record.id, record.userId, hashed);
    await sessionService.revokeAllForUser(record.userId);

    return { ok: true as const, userId: record.userId };
  }
};
