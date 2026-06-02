import { z } from 'zod';

export const expenseIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const expenseReportQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  expenseType: z.enum(['GENERAL', 'SALARY', 'VEHICLE']).optional(),
});

export const createExpenseCategorySchema = z.object({
  name: z.string().trim().min(1).max(160),
  expenseType: z.enum(['GENERAL', 'SALARY', 'VEHICLE']),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const createExpenseSchema = z.object({
  expenseDate: z.coerce.date(),
  expenseType: z.enum(['GENERAL', 'SALARY', 'VEHICLE']),
  categoryId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive().max(999999999999.99),
  vehicleId: z.coerce.number().int().positive().optional().nullable(),
  attachmentUrl: z.string().trim().url().max(500).optional().nullable(),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  notes: z.string().trim().optional().nullable(),
});
