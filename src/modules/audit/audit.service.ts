import type { Context } from 'hono';
import { auditRepository } from './audit.repository.js';
import type { AuditInput } from './audit.types.js';

export function getRequestMeta(c: Context) {
  return {
    ipAddress:
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('cf-connecting-ip') ||
      'unknown',
    userAgent: c.req.header('user-agent') ?? 'unknown'
  };
}

export async function writeAuditLog(input: AuditInput) {
  await auditRepository.insert({
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    targetUserId: input.targetUserId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null
  });
}

export async function auditFromContext(
  c: Context,
  input: Omit<AuditInput, 'ipAddress' | 'userAgent'>
) {
  const meta = getRequestMeta(c);
  await writeAuditLog({ ...input, ...meta });
}

export const auditService = {
  getRequestMeta,
  writeAuditLog,
  auditFromContext
};
