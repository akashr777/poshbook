import { z } from 'zod';

export const vendorLedgerVendorParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const vendorLedgerQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const createVendorPurchaseSchema = z.object({
  vehicleId: z.coerce.number().int().positive().optional().nullable(),
  purchaseDate: z.coerce.date(),
  invoiceNo: z.string().trim().max(100).optional().nullable(),
  amount: z.coerce.number().positive().max(999999999999.99),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  notes: z.string().trim().optional().nullable(),
});

export const createVendorPaymentSchema = z.object({
  amount: z.coerce.number().positive().max(999999999999.99),
  paidDate: z.coerce.date(),
  paymentMode: z.string().trim().min(1).max(80),
  notes: z.string().trim().optional().nullable(),
});
