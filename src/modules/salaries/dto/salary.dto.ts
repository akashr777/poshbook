import type { z } from 'zod';
import type { createSalaryExpenseSchema, salaryReportQuerySchema } from '../validators/salary.validation';

export type CreateSalaryExpenseDto = z.infer<typeof createSalaryExpenseSchema>;
export type SalaryReportQueryDto = z.infer<typeof salaryReportQuerySchema>;
