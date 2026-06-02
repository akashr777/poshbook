import type { UserRow } from '../../db/schema';
import type { UserRole, UserStatus } from '../../types/app';

export type PublicUser = Omit<UserRow, 'password'>;

export function toPublicUser(user: UserRow): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export type UserCreateInput = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
};

export type UserUpdateInput = {
  name?: string;
  avatar?: string | null;
  role?: UserRole;
  status?: UserStatus;
};

export type UsersQueryInput = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};
