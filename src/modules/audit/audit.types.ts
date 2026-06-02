export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'auth.refresh'
  | 'auth.password.changed'
  | 'auth.password.reset.requested'
  | 'auth.password.reset.completed'
  | 'users.created'
  | 'users.deleted'
  | 'users.updated'
  | 'vendors.created'
  | 'vendors.updated'
  | 'vendors.deleted'
  | 'vehicles.created'
  | 'vehicles.updated'
  | 'vehicles.deleted'
  | 'daybook.created'
  | 'daybook.updated'
  | 'daybook.deleted';

export type AuditInput = {
  action: AuditAction;
  actorUserId?: number | null;
  targetUserId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};
