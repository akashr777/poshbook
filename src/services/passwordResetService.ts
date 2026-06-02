import { createHash, randomBytes } from 'crypto';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { passwordResetTokens, users } from '../db/schema.js';
import { env } from '../config/env.js';
import { passwordService } from './passwordService.js';
import { emailService } from './emailService.js';
import { sessionService } from '../modules/sessions/index.js';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export const passwordResetService = {
  async requestReset(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || user.status !== 'active') {
      return { sent: false };
    }

    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_SECONDS * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl, env.PASSWORD_RESET_TTL_SECONDS);

    return { sent: true, userId: user.id };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!record) {
      return { ok: false as const, reason: 'INVALID_TOKEN' as const };
    }

    const hashed = await passwordService.hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(eq(passwordResetTokens.id, record.id));

      await tx.update(users).set({ password: hashed }).where(eq(users.id, record.userId));
    });

    await sessionService.revokeAllForUser(record.userId);

    return { ok: true as const, userId: record.userId };
  }
};
