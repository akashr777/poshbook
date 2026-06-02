import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { passwordResetTokens, users } from '../../db/schema.js';

export const authRepository = {
  async deactivateOlderResetTokens(userId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)));
  },

  async insertResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt
    });
  },

  async findActiveResetToken(tokenHash: string): Promise<typeof passwordResetTokens.$inferSelect | null> {
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

    return record ?? null;
  },

  async executePasswordReset(tokenId: number, userId: number, passwordHash: string): Promise<void> {
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(eq(passwordResetTokens.id, tokenId));

      await tx.update(users).set({ password: passwordHash }).where(eq(users.id, userId));
    });
  },

  async updateUserPassword(userId: number, passwordHash: string): Promise<void> {
    await db.update(users).set({ password: passwordHash }).where(eq(users.id, userId));
  }
};
