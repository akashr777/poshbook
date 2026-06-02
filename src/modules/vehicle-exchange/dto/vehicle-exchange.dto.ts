import type { z } from 'zod';
import type { createVehicleExchangeSchema, exchangeReportQuerySchema } from '../validators/vehicle-exchange.validation.js';

export type CreateVehicleExchangeDto = z.infer<typeof createVehicleExchangeSchema>;
export type ExchangeReportQueryDto = z.infer<typeof exchangeReportQuerySchema>;
