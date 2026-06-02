import type { UserRole } from '../../types/app';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  jti: string;
};
