import { z } from 'zod';

const moneySchema = z.coerce.number().min(0).max(999999999999.99);
const entryDateSchema = z.coerce.date();

const baseEntrySchema = z.object({
  vehicleId: z.coerce.number().int().positive(), // Changed from uuid to number
  entryType: z.enum(['debit', 'credit']),
  category: z.string().trim().min(1).max(120),
  particular: z.string().trim().min(1).max(255),
  debitAmount: moneySchema.default(0),
  creditAmount: moneySchema.default(0),
  paymentMode: z.string().trim().min(1).max(80),
  paidBy: z.string().trim().min(1).max(160),
  paidTo: z.string().trim().min(1).max(160),
  notes: z.string().trim().max(2000).optional().nullable(),
  entryDate: entryDateSchema,
});

function validateDebitCredit<T extends z.infer<typeof baseEntrySchema>>(data: T, ctx: z.RefinementCtx) {
  if (data.entryType === 'debit') {
    if (data.debitAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['debitAmount'],
        message: 'Debit entries require a debit amount greater than 0',
      });
    }
    if (data.creditAmount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditAmount'],
        message: 'Debit entries cannot have a credit amount',
      });
    }
  }

  if (data.entryType === 'credit') {
    if (data.creditAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditAmount'],
        message: 'Credit entries require a credit amount greater than 0',
      });
    }
    if (data.debitAmount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['debitAmount'],
        message: 'Credit entries cannot have a debit amount',
      });
    }
  }
}

export const createDaybookEntrySchema = baseEntrySchema.superRefine(validateDebitCredit);

export const updateDaybookEntrySchema = baseEntrySchema.partial().superRefine((data, ctx) => {
  if (!data.entryType) return;

  validateDebitCredit({
    vehicleId: data.vehicleId ?? 1, // Changed from UUID placeholder to number
    category: data.category ?? 'category',
    particular: data.particular ?? 'particular',
    paymentMode: data.paymentMode ?? 'cash',
    paidBy: data.paidBy ?? 'paidBy',
    paidTo: data.paidTo ?? 'paidTo',
    entryDate: data.entryDate ?? new Date(),
    notes: data.notes,
    entryType: data.entryType,
    debitAmount: data.debitAmount ?? 0,
    creditAmount: data.creditAmount ?? 0,
  }, ctx);
});

export const daybookIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const daybookVehicleParamSchema = z.object({
  vehicleId: z.coerce.number().int().positive(), // Changed from uuid to number
});

export const listDaybookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  vehicleId: z.coerce.number().int().positive().optional(), // Changed from uuid to number
  entryType: z.enum(['debit', 'credit']).optional(),
  category: z.string().trim().optional(),
  paymentMode: z.string().trim().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const reportQuerySchema = z.object({
  vehicleId: z.coerce.number().int().positive().optional(), // Changed from uuid to number
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});