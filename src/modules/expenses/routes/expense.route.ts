import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { expenseController } from '../controllers/expense.controller.js';
import { createExpenseCategorySchema, createExpenseSchema, expenseReportQuerySchema } from '../validators/expense.validation.js';

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
