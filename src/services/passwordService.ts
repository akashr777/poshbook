import bcrypt from 'bcryptjs';
import { env } from '../config/env';

function randomString(bytes: Uint8Array) {
  const b64 = Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export const passwordService = {
  async generateSecureRandomPassword(length = 18) {
    const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil((length * 3) / 4)));
    return randomString(bytes).slice(0, length);
  },

  async hashPassword(password: string) {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
};

