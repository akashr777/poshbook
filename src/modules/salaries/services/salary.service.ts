import { db } from '../../../db';
import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository';
import { salaryRepository } from '../repositories/salary.repository';
import type { CreateSalaryExpenseDto, SalaryReportQueryDto } from '../dto/salary.dto';

export const salaryService = {
  async create(input: CreateSalaryExpenseDto, createdBy: number) {
    try {
      return await db.transaction(async (tx) => {
        const salary = await salaryRepository.create(input, createdBy, tx as any);
        await cashLedgerRepository.create(
          {
            ledgerDate: input.paidDate,
            module: 'SALARIES',
            referenceType: 'salary_expenses',
            referenceId: salary.id,
            direction: 'OUT',
            amount: input.amount,
            paymentMode: input.paymentMode,
            notes: `Salary: ${input.employeeName} ${input.salaryMonth}/${input.salaryYear}`,
            createdBy,
          },
          tx as any
        );
        return salary;
      });
    } catch (err) {
      const message = String((err as Error).message ?? '');
      if (message.includes('salary_expenses_employee_month_unique')) {
        throw Object.assign(new Error('Duplicate salary entry'), { code: 'DUPLICATE_SALARY_ENTRY' });
      }
      throw err;
    }
  },

  list(query?: SalaryReportQueryDto) {
    return salaryRepository.list(query);
  },

  aggregate(query?: SalaryReportQueryDto) {
    return salaryRepository.aggregate(query);
  },
};
