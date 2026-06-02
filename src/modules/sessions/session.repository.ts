import { and, eq, isNull, gt } from 'drizzle-orm';
import { db } from '../../db';
import { refreshSessions } from '../../db/schema';

export const sessionRepository = {
  async insert(jti: string, userId: number, expiresAt: Date): Promise<void> {
    await db.insert(refreshSessions).values({
      jti,
      userId,
      expiresAt
    });
  },

  async findActive(jti: string, userId: number): Promise<boolean> {
    const now = new Date();
    const [session] = await db
      .select()
      .from(refreshSessions)
      .where(
        and(
          eq(refreshSessions.jti, jti),
          eq(refreshSessions.userId, userId),
          isNull(refreshSessions.revokedAt),
          gt(refreshSessions.expiresAt, now)
        )
      )
      .limit(1);

    return Boolean(session);
  },

  async updateRevoked(jti: string): Promise<void> {
    await db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshSessions.jti, jti), isNull(refreshSessions.revokedAt)));
  },

  async updateRevokedAllForUser(userId: number): Promise<void> {
    await db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshSessions.userId, userId), isNull(refreshSessions.revokedAt)));
  }
};
