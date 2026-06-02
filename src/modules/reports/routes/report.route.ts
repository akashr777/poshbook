import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { reportController } from '../controllers/report.controller';
import { reportQuerySchema } from '../validators/report.validation';

export const reportsRouter = new Hono<{ Variables: AppVariables }>();

reportsRouter.use('*', jwtAuth);

reportsRouter.get('/funders', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.funders(c));
reportsRouter.get('/vendors', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.vendors(c));
reportsRouter.get('/expenses', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.expenses(c));
reportsRouter.get('/salaries', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.salaries(c));
reportsRouter.get('/vehicles', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.vehicles(c));
reportsRouter.get('/exchanges', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.exchanges(c));
reportsRouter.get('/profit-loss', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.profitLoss(c));
reportsRouter.get('/cash-flow', requirePermission(Permission.REPORTS_VIEW), validateRequest(reportQuerySchema, 'query'), (c) => reportController.cashFlow(c));
