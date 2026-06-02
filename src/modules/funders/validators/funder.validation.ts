import { z } from 'zod';

export const funderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listFundersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['funderName', 'funderCode', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createFunderSchema = z.object({
  funderCode: z.string().trim().min(1).max(50),
  funderName: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(320).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateFunderSchema = createFunderSchema.partial();

export const createFunderTransactionSchema = z.object({
  transactionType: z.enum(['FUND_IN', 'REPAYMENT']),
  amount: z.coerce.number().positive().max(999999999999.99),
  transactionDate: z.coerce.date(),
  referenceType: z.string().trim().max(80).optional().nullable(),
  referenceId: z.coerce.number().int().positive().optional().nullable(),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  notes: z.string().trim().optional().nullable(),
});

export const ledgerQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});
