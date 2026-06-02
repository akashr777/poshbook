import { and, desc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { salaryExpenses } from '../schemas/salary.schema';
import type { CreateSalaryExpenseDto, SalaryReportQueryDto } from '../dto/salary.dto';

type DbClient = typeof db;

function salaryFilters(query: SalaryReportQueryDto = {}) {
  const filters = [] as any[];
  if (query.fromDate) filters.push(gte(salaryExpenses.paidDate, query.fromDate));
  if (query.toDate) filters.push(lte(salaryExpenses.paidDate, query.toDate));
  return filters.length ? and(...filters) : undefined;
}

export const salaryRepository = {
  async create(input: CreateSalaryExpenseDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(salaryExpenses)
      .values({
        employeeName: input.employeeName,
        salaryMonth: input.salaryMonth,
        salaryYear: input.salaryYear,
        amount: input.amount,
        paidDate: input.paidDate,
        createdBy,
      })
      .returning();
    return created;
  },

  list(query: SalaryReportQueryDto = {}) {
    return db.select().from(salaryExpenses).where(salaryFilters(query)).orderBy(desc(salaryExpenses.paidDate), desc(salaryExpenses.id));
  },

  async aggregate(query: SalaryReportQueryDto = {}) {
    const [row] = await db
      .select({ totalSalaryExpense: sql<number>`coalesce(sum(${salaryExpenses.amount}), 0)` })
      .from(salaryExpenses)
      .where(salaryFilters(query));
    return { totalSalaryExpense: Number(row?.totalSalaryExpense ?? 0) };
  },
};
