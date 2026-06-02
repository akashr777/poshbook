import { sessionRepository } from './session.repository';

export const sessionService = {
  async createSession(jti: string, userId: number, expiresAt: Date): Promise<void> {
    await sessionRepository.insert(jti, userId, expiresAt);
  },

  async isSessionActive(jti: string, userId: number): Promise<boolean> {
    return sessionRepository.findActive(jti, userId);
  },

  async revokeSession(jti: string): Promise<void> {
    await sessionRepository.updateRevoked(jti);
  },

  async revokeAllForUser(userId: number): Promise<void> {
    await sessionRepository.updateRevokedAllForUser(userId);
  }
};
export type SessionService = typeof sessionService;
