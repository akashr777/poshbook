import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { vehicleExchangeController } from '../controllers/vehicle-exchange.controller';
import { createVehicleExchangeSchema, exchangeReportQuerySchema } from '../validators/vehicle-exchange.validation';

export const vehicleExchangeRouter = new Hono<{ Variables: AppVariables }>();

vehicleExchangeRouter.use('*', jwtAuth);

vehicleExchangeRouter.post('/', requirePermission(Permission.VEHICLES_UPDATE), validateRequest(createVehicleExchangeSchema), (c) =>
  vehicleExchangeController.create(c)
);
vehicleExchangeRouter.get('/', requirePermission(Permission.VEHICLES_LIST), validateRequest(exchangeReportQuerySchema, 'query'), (c) =>
  vehicleExchangeController.list(c)
);
