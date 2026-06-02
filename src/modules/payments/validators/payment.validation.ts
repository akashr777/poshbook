import { z } from 'zod';

export const createPaymentSchema = z.object({
  ledgerDate: z.coerce.date(),
  module: z.enum(['FUNDERS', 'VENDORS', 'EXPENSES', 'SALARIES', 'VEHICLES', 'VEHICLE_EXCHANGE', 'PAYMENTS', 'DAYBOOK']).default('PAYMENTS'),
  referenceType: z.string().trim().min(1).max(80),
  referenceId: z.coerce.number().int().positive().optional().nullable(),
  direction: z.enum(['IN', 'OUT']),
  amount: z.coerce.number().positive().max(999999999999.99),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  notes: z.string().trim().optional().nullable(),
});
