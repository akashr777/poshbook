import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { users } from '../db/schema';
import { db } from '../db';
import { passwordService } from './passwordService';
import { sessionService } from '../modules/sessions';
import { userService } from '../modules/users';
import type { UserRole } from '../types/app';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  jti: string;
};

function accessSecret() {
  return new TextEncoder().encode(env.JWT_ACCESS_SECRET);
}

function refreshSecret() {
  return new TextEncoder().encode(env.JWT_REFRESH_SECRET);
}

export const authService = {
  async verifyUserLogin(email: string, password: string) {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      console.log('User found:', !!user);
      
      if (!user) {
        console.log('FAILED: No user found with email:', email);
        return null;
      }
      
      console.log('User ID:', user.id);
      console.log('User status:', user.status);
      console.log('User role:', user.role);
      console.log('Stored password hash (first 20 chars):', user.password?.substring(0, 20) + '...');
      
      // FIXED: Case-insensitive status check
      if (user.status.toLowerCase() !== 'active') {
        console.log('FAILED: User status is not active:', user.status);
        return null;
      }

      const ok = await passwordService.comparePassword(password, user.password);
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

  async createAccessToken(payload: { id: string; email: string; role: UserRole }) {
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

  async createRefreshToken(payload: { id: string; email: string; role: UserRole }) {
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

    const active = await userService.isActiveUser(userId);
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

  async revokeRefreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return false;
    await sessionService.revokeSession(payload.jti);
    return true;
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return { ok: false as const, reason: 'USER_NOT_FOUND' as const };

    const valid = await passwordService.comparePassword(currentPassword, user.password);
    if (!valid) return { ok: false as const, reason: 'INVALID_CURRENT_PASSWORD' as const };

    const hashed = await passwordService.hashPassword(newPassword);
    await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
    await sessionService.revokeAllForUser(userId);

    return { ok: true as const };
  }
};