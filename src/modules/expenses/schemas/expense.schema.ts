import { index, integer, numeric, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { vehicles } from '../../vehicles/vehicle.schema.js';

export const expenseTypeEnum = pgEnum('expense_type', ['GENERAL', 'SALARY', 'VEHICLE']);
export const expenseCategoryStatusEnum = pgEnum('expense_category_status', ['active', 'inactive']);

export const expenseCategories = pgTable(
  'expense_categories',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    expenseType: expenseTypeEnum('expenseType').notNull(),
    status: expenseCategoryStatusEnum('status').notNull().default('active'),
  },
  (table) => ({
    typeIdx: index('expense_categories_type_idx').on(table.expenseType),
    statusIdx: index('expense_categories_status_idx').on(table.status),
  })
);

export const expenses = pgTable(
  'expenses',
  {
    id: serial('id').primaryKey(),
    expenseDate: timestamp('expenseDate').notNull(),
    expenseType: expenseTypeEnum('expenseType').notNull(),
    categoryId: integer('categoryId')
      .notNull()
      .references(() => expenseCategories.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    vehicleId: integer('vehicleId').references(() => vehicles.id, { onDelete: 'set null' }),
    attachmentUrl: varchar('attachmentUrl', { length: 500 }),
    notes: text('notes'),
    createdBy: integer('createdBy').notNull(),
  },
  (table) => ({
    dateIdx: index('expenses_date_idx').on(table.expenseDate),
    typeIdx: index('expenses_type_idx').on(table.expenseType),
    categoryIdx: index('expenses_category_idx').on(table.categoryId),
    vehicleIdx: index('expenses_vehicle_idx').on(table.vehicleId),
  })
);

export type ExpenseCategoryRow = typeof expenseCategories.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type NewExpenseCategoryRow = typeof expenseCategories.$inferInsert;
export type NewExpenseRow = typeof expenses.$inferInsert;
