import { db } from '../../db';
import { auditLogs } from '../../db/schema';
import { logger } from '../../utils/logger';

export type AuditRepositoryInput = {
  action: string;
  actorUserId?: number | null;
  targetUserId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
};

export const auditRepository = {
  async insert(input: AuditRepositoryInput): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        action: input.action,
        actorUserId: input.actorUserId ?? null,
        targetUserId: input.targetUserId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ?? null
      });
    } catch (err) {
      logger.error({ err, action: input.action }, 'failed to write audit log in repository');
    }
  }
};
