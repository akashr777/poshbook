import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateParams, validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { vehicleAccountingController } from '../controllers/vehicle-accounting.controller.js';
import { createVehicleSaleSchema, vehicleAccountingVehicleParamSchema } from '../validators/vehicle-accounting.validation.js';

export const vehicleAccountingRouter = new Hono<{ Variables: AppVariables }>();

vehicleAccountingRouter.use('*', jwtAuth);

vehicleAccountingRouter.post(
  '/:id/sale',
  requirePermission(Permission.VEHICLES_UPDATE),
  validateParams(vehicleAccountingVehicleParamSchema),
  validateRequest(createVehicleSaleSchema),
  (c) => vehicleAccountingController.createSale(c)
);
