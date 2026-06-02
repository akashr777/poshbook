import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { salaryController } from '../controllers/salary.controller.js';
import { createSalaryExpenseSchema, salaryReportQuerySchema } from '../validators/salary.validation.js';

export const salariesRouter = new Hono<{ Variables: AppVariables }>();

salariesRouter.use('*', jwtAuth);

salariesRouter.get('/', requirePermission(Permission.SALARIES_VIEW), validateRequest(salaryReportQuerySchema, 'query'), (c) =>
  salaryController.list(c)
);
salariesRouter.post('/', requirePermission(Permission.SALARIES_CREATE), validateRequest(createSalaryExpenseSchema), (c) =>
  salaryController.create(c)
);
