// src/constants/roles.constants.ts

export const USER_ROLES = [
  'admin',
  'user',
  'staff',
  'partner',
  'funder'
] as const;

export type UserRole = typeof USER_ROLES[number];
