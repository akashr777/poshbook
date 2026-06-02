import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { salaryService } from '../services/salary.service';
import type { CreateSalaryExpenseDto, SalaryReportQueryDto } from '../dto/salary.dto';

type SalaryContext = Context<{ Variables: AppVariables }>;

export const salaryController = {
  async list(c: SalaryContext) {
    const items = await salaryService.list(c.req.validated as SalaryReportQueryDto);
    return ok(c, { items });
  },

  async create(c: SalaryContext) {
    const authUser = c.get('user');
    try {
      const salary = await salaryService.create(c.req.validated as CreateSalaryExpenseDto, Number(authUser.id));
      return ok(c, { salary }, 201);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'DUPLICATE_SALARY_ENTRY') return fail(c, { message: 'Salary already paid for this employee and month', code }, 409);
      return fail(c, { message: 'Failed to process salary', code: 'SALARY_OPERATION_FAILED' }, 400);
    }
  },
};
