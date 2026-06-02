import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { dashboardController } from '../controllers/dashboard.controller';

export const dashboardRouter = new Hono<{ Variables: AppVariables }>();

dashboardRouter.use('*', jwtAuth);

dashboardRouter.get('/summary', requirePermission(Permission.DASHBOARD_VIEW), (c) => dashboardController.summary(c));
