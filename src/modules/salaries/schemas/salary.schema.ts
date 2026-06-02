import { index, integer, numeric, pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const salaryExpenses = pgTable(
  'salary_expenses',
  {
    id: serial('id').primaryKey(),
    employeeName: varchar('employeeName', { length: 200 }).notNull(),
    salaryMonth: integer('salaryMonth').notNull(),
    salaryYear: integer('salaryYear').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    paidDate: timestamp('paidDate').notNull(),
    createdBy: integer('createdBy').notNull(),
  },
  (table) => ({
    employeeMonthUnique: uniqueIndex('salary_expenses_employee_month_unique').on(
      table.employeeName,
      table.salaryMonth,
      table.salaryYear
    ),
    paidDateIdx: index('salary_expenses_paid_date_idx').on(table.paidDate),
  })
);

export type SalaryExpenseRow = typeof salaryExpenses.$inferSelect;
export type NewSalaryExpenseRow = typeof salaryExpenses.$inferInsert;
