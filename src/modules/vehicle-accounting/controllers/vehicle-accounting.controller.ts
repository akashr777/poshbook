import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses.js';
import type { AppVariables } from '../../../types/app.js';
import { vehicleAccountingService } from '../services/vehicle-accounting.service.js';
import type { CreateVehicleSaleDto } from '../dto/vehicle-accounting.dto.js';

type VehicleAccountingContext = Context<{ Variables: AppVariables }>;

export const vehicleAccountingController = {
  async createSale(c: VehicleAccountingContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');
    try {
      const sale = await vehicleAccountingService.createSale(id, c.req.validated as CreateVehicleSaleDto, Number(authUser.id));
      return ok(c, { sale }, 201);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'VEHICLE_NOT_FOUND') return fail(c, { message: 'Vehicle not found', code }, 404);
      return fail(c, { message: 'Failed to process vehicle sale', code: 'VEHICLE_SALE_FAILED' }, 400);
    }
  },
};
