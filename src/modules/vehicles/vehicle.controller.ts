import type { Context } from 'hono';
import { vehicleService } from './vehicle.service.js';
import type { VehicleListQuery, VehicleCreateInput, VehicleUpdateInput } from './vehicle.types.js';
import type { AppVariables } from '../../types/app.js';

type VehicleContext = Context<{ Variables: AppVariables }>;

function success(c: Context, message: string, data: unknown, status = 200) {
  c.status(status as any);
  return c.json({ success: true, message, data });
}

function error(c: Context, message: string, errors: unknown[] = [], status = 400) {
  c.status(status as any);
  return c.json({ success: false, message, errors });
}

export const vehicleController = {
  async list(c: VehicleContext) {
    const query = c.req.validated as VehicleListQuery;
    const result = await vehicleService.listVehicles(query);

    const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));

    return success(c, 'Vehicles loaded successfully', {
      items: result.items,
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages
    });
  },

  async getById(c: VehicleContext) {
    const { id } = c.req.validatedParams as { id: string };
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) {
      return error(c, 'Vehicle not found', [], 404);
    }

    return success(c, 'Vehicle retrieved successfully', { vehicle });
  },

  async create(c: VehicleContext) {
    const input = c.req.validated as VehicleCreateInput;
    const authUser = c.get('user');
    const vehicle = await vehicleService.createVehicle(input, authUser.id, c);

    return success(c, 'Vehicle created successfully', { vehicle }, 201);
  },

  async update(c: VehicleContext) {
    const { id } = c.req.validatedParams as { id: string };
    const input = c.req.validated as VehicleUpdateInput;
    const authUser = c.get('user');
    const updated = await vehicleService.updateVehicle(id, input, authUser.id, c);
    if (!updated) {
      return error(c, 'Vehicle not found', [], 404);
    }

    return success(c, 'Vehicle updated successfully', { vehicle: updated });
  },

  async remove(c: VehicleContext) {
    const { id } = c.req.validatedParams as { id: string };
    const authUser = c.get('user');
    const deleted = await vehicleService.removeVehicle(id, authUser.id, c);
    if (!deleted) {
      return error(c, 'Vehicle not found', [], 404);
    }

    return success(c, 'Vehicle deleted successfully', { deleted: true });
  }
};
