import { z } from 'zod';

export const vehicleAccountingVehicleParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createVehicleSaleSchema = z.object({
  saleDate: z.coerce.date(),
  saleAmount: z.coerce.number().positive().max(999999999999.99),
  buyerName: z.string().trim().min(1).max(200),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).default('PAID'),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  notes: z.string().trim().optional().nullable(),
});
