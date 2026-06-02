import { z } from 'zod';

export const salaryReportQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const createSalaryExpenseSchema = z.object({
  employeeName: z.string().trim().min(1).max(200),
  salaryMonth: z.coerce.number().int().min(1).max(12),
  salaryYear: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().positive().max(999999999999.99),
  paidDate: z.coerce.date(),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
});
