import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { expenseCategories, expenses } from '../schemas/expense.schema.js';
import type { CreateExpenseCategoryDto, CreateExpenseDto, ExpenseReportQueryDto } from '../dto/expense.dto.js';

type DbClient = typeof db;

function expenseFilters(query: ExpenseReportQueryDto = {}) {
  const filters = [] as any[];
  if (query.fromDate) filters.push(gte(expenses.expenseDate, query.fromDate));
  if (query.toDate) filters.push(lte(expenses.expenseDate, query.toDate));
  if (query.expenseType) filters.push(eq(expenses.expenseType, query.expenseType));
  return filters.length ? and(...filters) : undefined;
}

export const expenseRepository = {
  async createCategory(input: CreateExpenseCategoryDto) {
    const [created] = await db.insert(expenseCategories).values(input).returning();
    return created;
  },

  async categoryExists(categoryId: number, client: DbClient = db) {
    const [row] = await client.select({ id: expenseCategories.id }).from(expenseCategories).where(eq(expenseCategories.id, categoryId)).limit(1);
    return Boolean(row);
  },

  async create(input: CreateExpenseDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(expenses)
      .values({
        expenseDate: input.expenseDate,
        expenseType: input.expenseType,
        categoryId: input.categoryId,
        amount: input.amount,
        vehicleId: input.vehicleId ?? null,
        attachmentUrl: input.attachmentUrl ?? null,
        notes: input.notes ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async list(query: ExpenseReportQueryDto = {}) {
    return db.select().from(expenses).where(expenseFilters(query)).orderBy(desc(expenses.expenseDate), desc(expenses.id));
  },

  async aggregate(query: ExpenseReportQueryDto = {}) {
    const [row] = await db
      .select({ totalExpenses: sql<number>`coalesce(sum(${expenses.amount}), 0)` })
      .from(expenses)
      .where(expenseFilters(query));
    return { totalExpenses: Number(row?.totalExpenses ?? 0) };
  },
};
