import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses.js';
import type { AppVariables } from '../../../types/app.js';
import { vehicleExchangeService } from '../services/vehicle-exchange.service.js';
import type { CreateVehicleExchangeDto, ExchangeReportQueryDto } from '../dto/vehicle-exchange.dto.js';

type VehicleExchangeContext = Context<{ Variables: AppVariables }>;

export const vehicleExchangeController = {
  async create(c: VehicleExchangeContext) {
    const authUser = c.get('user');
    try {
      const result = await vehicleExchangeService.exchange(c.req.validated as CreateVehicleExchangeDto, Number(authUser.id));
      return ok(c, result, 201);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'OLD_VEHICLE_NOT_FOUND') return fail(c, { message: 'Old vehicle not found', code }, 404);
      return fail(c, { message: 'Failed to process vehicle exchange', code: 'VEHICLE_EXCHANGE_FAILED' }, 400);
    }
  },

  async list(c: VehicleExchangeContext) {
    const items = await vehicleExchangeService.list(c.req.validated as ExchangeReportQueryDto);
    return ok(c, { items });
  },
};
