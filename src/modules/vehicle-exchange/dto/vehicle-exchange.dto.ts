import type { z } from 'zod';
import type { createVehicleExchangeSchema, exchangeReportQuerySchema } from '../validators/vehicle-exchange.validation';

export type CreateVehicleExchangeDto = z.infer<typeof createVehicleExchangeSchema>;
export type ExchangeReportQueryDto = z.infer<typeof exchangeReportQuerySchema>;
