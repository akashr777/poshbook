import { Hono } from 'hono';
import { jwtAuth } from '../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../middlewares/auth/requirePermission';
import { validateParams, validateRequest } from '../../middlewares/validateRequest';
import { Permission } from '../../utils/permissions';
import { daybookController } from './daybook.controller';
import {
  createDaybookEntrySchema,
  daybookIdParamSchema,
  daybookVehicleParamSchema,
  listDaybookQuerySchema,
  monthlyReportQuerySchema,
  reportQuerySchema,
  updateDaybookEntrySchema,
} from './daybook.validation';
import type { AppVariables } from '../../types/app';

export const daybookRouter = new Hono<{ Variables: AppVariables }>();

daybookRouter.use('*', jwtAuth);

daybookRouter.get(
  '/',
  requirePermission(Permission.DAYBOOK_LIST),
  validateRequest(listDaybookQuerySchema, 'query'),
  (c) => daybookController.list(c)
);

daybookRouter.get(
  '/dashboard',
  requirePermission(Permission.DAYBOOK_REPORTS),
  (c) => daybookController.dashboard(c)
);

daybookRouter.get(
  '/vehicles/summary',
  requirePermission(Permission.DAYBOOK_REPORTS),
  (c) => daybookController.vehicleSummaries(c)
);

daybookRouter.get(
  '/vehicles/:vehicleId/ledger',
  requirePermission(Permission.DAYBOOK_REPORTS),
  validateParams(daybookVehicleParamSchema),
  (c) => daybookController.vehicleLedger(c)
);

daybookRouter.get(
  '/reports/daily',
  requirePermission(Permission.DAYBOOK_REPORTS),
  validateRequest(reportQuerySchema, 'query'),
  (c) => daybookController.dailyLedger(c)
);

daybookRouter.get(
  '/reports/monthly',
  requirePermission(Permission.DAYBOOK_REPORTS),
  validateRequest(monthlyReportQuerySchema, 'query'),
  (c) => daybookController.monthlyReport(c)
);

daybookRouter.get(
  '/reports/profit',
  requirePermission(Permission.DAYBOOK_REPORTS),
  validateRequest(reportQuerySchema, 'query'),
  (c) => daybookController.profitReport(c)
);

daybookRouter.get(
  '/:id',
  requirePermission(Permission.DAYBOOK_READ),
  validateParams(daybookIdParamSchema),
  (c) => daybookController.getById(c)
);

daybookRouter.post(
  '/',
  requirePermission(Permission.DAYBOOK_CREATE),
  validateRequest(createDaybookEntrySchema),
  (c) => daybookController.create(c)
);

daybookRouter.put(
  '/:id',
  requirePermission(Permission.DAYBOOK_UPDATE),
  validateParams(daybookIdParamSchema),
  validateRequest(updateDaybookEntrySchema),
  (c) => daybookController.update(c)
);

daybookRouter.delete(
  '/:id',
  requirePermission(Permission.DAYBOOK_DELETE),
  validateParams(daybookIdParamSchema),
  (c) => daybookController.remove(c)
);
