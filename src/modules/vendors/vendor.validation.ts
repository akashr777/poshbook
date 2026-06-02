import { z } from 'zod';

export const createVendorSchema = z.object({
  vendorCode: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(320).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  gstNumber: z.string().trim().max(30).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateVendorSchema = z.object({
  vendorCode: z.string().trim().min(1).max(50).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(320).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  gstNumber: z.string().trim().max(30).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const vendorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listVendorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['name', 'vendorCode', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

