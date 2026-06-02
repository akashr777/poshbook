import { z } from 'zod';
import { createVehicleSchema } from '../../vehicles/vehicle.validation';

export const createVehicleExchangeSchema = z.object({
  oldVehicleId: z.coerce.number().int().positive(),
  newVehicle: createVehicleSchema,
  exchangeValue: z.coerce.number().positive().max(999999999999.99),
  additionalPaid: z.coerce.number().min(0).max(999999999999.99).default(0),
  exchangeDate: z.coerce.date(),
  paymentMode: z.string().trim().min(1).max(80).default('cash'),
  remarks: z.string().trim().optional().nullable(),
});

export const exchangeReportQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});
