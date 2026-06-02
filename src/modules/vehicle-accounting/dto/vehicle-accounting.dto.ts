import type { z } from 'zod';
import type { createVehicleSaleSchema } from '../validators/vehicle-accounting.validation';

export type CreateVehicleSaleDto = z.infer<typeof createVehicleSaleSchema>;
