export type UserRole = 'admin' | 'user' | 'staff' | 'partner' | 'funder';
export type UserStatus = 'active' | 'inactive';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AppVariables = {
  user: AuthUser;
  requestId?: string;
  secureHeadersNonce?: string | undefined;
};
