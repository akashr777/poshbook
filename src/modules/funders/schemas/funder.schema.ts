import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const funderStatusEnum = pgEnum('funder_status', ['active', 'inactive']);
export const funderTransactionTypeEnum = pgEnum('funder_transaction_type', ['FUND_IN', 'REPAYMENT']);

export const funders = pgTable(
  'funders',
  {
    id: serial('id').primaryKey(),
    funderCode: varchar('funderCode', { length: 50 }).notNull().unique(),
    funderName: varchar('funderName', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    email: varchar('email', { length: 320 }),
    address: text('address'),
    notes: text('notes'),
    status: funderStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('createdAt').notNull().default(sql`now()`),
    updatedAt: timestamp('updatedAt').notNull().default(sql`now()`),
  },
  (table) => ({
    codeIdx: index('funders_funder_code_idx').on(table.funderCode),
    nameIdx: index('funders_funder_name_idx').on(table.funderName),
    statusIdx: index('funders_status_idx').on(table.status),
  })
);

export const funderTransactions = pgTable(
  'funder_transactions',
  {
    id: serial('id').primaryKey(),
    funderId: integer('funderId')
      .notNull()
      .references(() => funders.id, { onDelete: 'cascade' }),
    transactionType: funderTransactionTypeEnum('transactionType').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    transactionDate: timestamp('transactionDate').notNull(),
    referenceType: varchar('referenceType', { length: 80 }),
    referenceId: integer('referenceId'),
    notes: text('notes'),
    createdBy: integer('createdBy').notNull(),
    createdAt: timestamp('createdAt').notNull().default(sql`now()`),
  },
  (table) => ({
    funderIdx: index('funder_transactions_funder_idx').on(table.funderId),
    dateIdx: index('funder_transactions_date_idx').on(table.transactionDate),
    typeIdx: index('funder_transactions_type_idx').on(table.transactionType),
  })
);

export type FunderRow = typeof funders.$inferSelect;
export type NewFunderRow = typeof funders.$inferInsert;
export type FunderTransactionRow = typeof funderTransactions.$inferSelect;
export type NewFunderTransactionRow = typeof funderTransactions.$inferInsert;
