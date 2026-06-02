import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { salaryController } from '../controllers/salary.controller';
import { createSalaryExpenseSchema, salaryReportQuerySchema } from '../validators/salary.validation';

export const salariesRouter = new Hono<{ Variables: AppVariables }>();

salariesRouter.use('*', jwtAuth);

salariesRouter.get('/', requirePermission(Permission.SALARIES_VIEW), validateRequest(salaryReportQuerySchema, 'query'), (c) =>
  salaryController.list(c)
);
salariesRouter.post('/', requirePermission(Permission.SALARIES_CREATE), validateRequest(createSalaryExpenseSchema), (c) =>
  salaryController.create(c)
);
