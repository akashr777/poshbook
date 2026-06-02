import { z } from 'zod';

import { USER_ROLES }
from '../../constants/roles.constants';

import { USER_STATUS }
from '../../constants/user-status.constants';

// ======================================================
// CREATE USER SCHEMA
// ======================================================

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name cannot exceed 200 characters'),

  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase(),

  role: z
    .enum(USER_ROLES)
    .default('staff'),

  status: z
    .enum(USER_STATUS)
    .default('active'),

  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable()
});

// ======================================================
// UPDATE USER SCHEMA
// ======================================================

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name cannot exceed 200 characters')
    .optional(),

  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase()
    .optional(),

  role: z
    .enum(USER_ROLES)
    .optional(),

  status: z
    .enum(USER_STATUS)
    .optional(),

  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable()
});

// ======================================================
// USERS QUERY SCHEMA
// ======================================================

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(50).default(10),

  search: z.string().trim().optional(),

  role: z.enum(USER_ROLES).optional(),

  status: z.enum(USER_STATUS).optional(),

  sortBy: z.enum([
    'name',
    'email',
    'role',
    'status',
    'createdAt'
  ]).default('createdAt'),

  sortOrder: z.enum([
    'asc',
    'desc'
  ]).default('desc')
});

// ======================================================
// USER ID PARAM SCHEMA
// ======================================================

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid user ID')
});