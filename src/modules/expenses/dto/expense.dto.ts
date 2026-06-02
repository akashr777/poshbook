import type { z } from 'zod';
import type {
  createExpenseCategorySchema,
  createExpenseSchema,
  expenseReportQuerySchema,
} from '../validators/expense.validation';

export type CreateExpenseCategoryDto = z.infer<typeof createExpenseCategorySchema>;
export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type ExpenseReportQueryDto = z.infer<typeof expenseReportQuerySchema>;
