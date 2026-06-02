import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateParams, validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { vehicleAccountingController } from '../controllers/vehicle-accounting.controller';
import { createVehicleSaleSchema, vehicleAccountingVehicleParamSchema } from '../validators/vehicle-accounting.validation';

export const vehicleAccountingRouter = new Hono<{ Variables: AppVariables }>();

vehicleAccountingRouter.use('*', jwtAuth);

vehicleAccountingRouter.post(
  '/:id/sale',
  requirePermission(Permission.VEHICLES_UPDATE),
  validateParams(vehicleAccountingVehicleParamSchema),
  validateRequest(createVehicleSaleSchema),
  (c) => vehicleAccountingController.createSale(c)
);
