import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { expenseController } from '../controllers/expense.controller';
import { createExpenseCategorySchema, createExpenseSchema, expenseReportQuerySchema } from '../validators/expense.validation';

export const expensesRouter = new Hono<{ Variables: AppVariables }>();

expensesRouter.use('*', jwtAuth);

expensesRouter.get('/', requirePermission(Permission.EXPENSES_VIEW), validateRequest(expenseReportQuerySchema, 'query'), (c) =>
  expenseController.list(c)
);
expensesRouter.post('/', requirePermission(Permission.EXPENSES_CREATE), validateRequest(createExpenseSchema), (c) =>
  expenseController.create(c)
);
expensesRouter.post(
  '/categories',
  requirePermission(Permission.EXPENSES_CREATE),
  validateRequest(createExpenseCategorySchema),
  (c) => expenseController.createCategory(c)
);
