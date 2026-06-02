import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { dashboardController } from '../controllers/dashboard.controller.js';

export const dashboardRouter = new Hono<{ Variables: AppVariables }>();

dashboardRouter.use('*', jwtAuth);

dashboardRouter.get('/summary', requirePermission(Permission.DASHBOARD_VIEW), (c) => dashboardController.summary(c));
