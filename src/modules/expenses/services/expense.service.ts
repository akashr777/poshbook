import { db } from '../../../db/index.js';
import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository.js';
import { expenseRepository } from '../repositories/expense.repository.js';
import type { CreateExpenseCategoryDto, CreateExpenseDto, ExpenseReportQueryDto } from '../dto/expense.dto.js';

export const expenseService = {
  createCategory(input: CreateExpenseCategoryDto) {
    return expenseRepository.createCategory(input);
  },

  async create(input: CreateExpenseDto, createdBy: number) {
    return db.transaction(async (tx) => {
      if (!(await expenseRepository.categoryExists(input.categoryId, tx as any))) {
        throw Object.assign(new Error('Expense category not found'), { code: 'EXPENSE_CATEGORY_NOT_FOUND' });
      }

      const expense = await expenseRepository.create(input, createdBy, tx as any);
      await cashLedgerRepository.create(
        {
          ledgerDate: input.expenseDate,
          module: 'EXPENSES',
          referenceType: 'expenses',
          referenceId: expense.id,
          direction: 'OUT',
          amount: input.amount,
          paymentMode: input.paymentMode,
          notes: input.notes ?? null,
          createdBy,
        },
        tx as any
      );
      return expense;
    });
  },

  list(query?: ExpenseReportQueryDto) {
    return expenseRepository.list(query);
  },

  aggregate(query?: ExpenseReportQueryDto) {
    return expenseRepository.aggregate(query);
  },
};
