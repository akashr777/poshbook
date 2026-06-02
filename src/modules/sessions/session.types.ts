export interface RefreshSessionRecord {
  id: number;
  jti: string;
  userId: number;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}
