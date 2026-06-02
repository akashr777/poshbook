import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { vehicleExchangeController } from '../controllers/vehicle-exchange.controller.js';
import { createVehicleExchangeSchema, exchangeReportQuerySchema } from '../validators/vehicle-exchange.validation.js';

export const vehicleExchangeRouter = new Hono<{ Variables: AppVariables }>();

vehicleExchangeRouter.use('*', jwtAuth);

vehicleExchangeRouter.post('/', requirePermission(Permission.VEHICLES_UPDATE), validateRequest(createVehicleExchangeSchema), (c) =>
  vehicleExchangeController.create(c)
);
vehicleExchangeRouter.get('/', requirePermission(Permission.VEHICLES_LIST), validateRequest(exchangeReportQuerySchema, 'query'), (c) =>
  vehicleExchangeController.list(c)
);
