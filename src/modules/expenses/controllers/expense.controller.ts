import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { expenseService } from '../services/expense.service';
import type { CreateExpenseCategoryDto, CreateExpenseDto, ExpenseReportQueryDto } from '../dto/expense.dto';

type ExpenseContext = Context<{ Variables: AppVariables }>;

function knownError(c: ExpenseContext, err: unknown) {
  const code = (err as { code?: string }).code;
  if (code === 'EXPENSE_CATEGORY_NOT_FOUND') return fail(c, { message: 'Expense category not found', code }, 404);
  return fail(c, { message: 'Failed to process expense', code: 'EXPENSE_OPERATION_FAILED' }, 400);
}

export const expenseController = {
  async list(c: ExpenseContext) {
    const items = await expenseService.list(c.req.validated as ExpenseReportQueryDto);
    return ok(c, { items });
  },

  async create(c: ExpenseContext) {
    const authUser = c.get('user');
    try {
      const expense = await expenseService.create(c.req.validated as CreateExpenseDto, Number(authUser.id));
      return ok(c, { expense }, 201);
    } catch (err) {
      return knownError(c, err);
    }
  },

  async createCategory(c: ExpenseContext) {
    const category = await expenseService.createCategory(c.req.validated as CreateExpenseCategoryDto);
    return ok(c, { category }, 201);
  },
};
