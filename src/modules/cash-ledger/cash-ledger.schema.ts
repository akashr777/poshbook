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

export const cashLedgerDirectionEnum = pgEnum('cash_ledger_direction', ['IN', 'OUT']);
export const cashLedgerModuleEnum = pgEnum('cash_ledger_module', [
  'FUNDERS',
  'VENDORS',
  'EXPENSES',
  'SALARIES',
  'VEHICLES',
  'VEHICLE_EXCHANGE',
  'PAYMENTS',
  'DAYBOOK',
]);

export const cashLedger = pgTable(
  'cash_ledger',
  {
    id: serial('id').primaryKey(),
    ledgerDate: timestamp('ledgerDate').notNull(),
    module: cashLedgerModuleEnum('module').notNull(),
    referenceType: varchar('referenceType', { length: 80 }).notNull(),
    referenceId: integer('referenceId'),
    direction: cashLedgerDirectionEnum('direction').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    paymentMode: varchar('paymentMode', { length: 80 }).notNull().default('cash'),
    notes: text('notes'),
    createdBy: integer('createdBy').notNull(),
    createdAt: timestamp('createdAt').notNull().default(sql`now()`),
  },
  (table) => ({
    ledgerDateIdx: index('cash_ledger_ledger_date_idx').on(table.ledgerDate),
    moduleIdx: index('cash_ledger_module_idx').on(table.module),
    referenceIdx: index('cash_ledger_reference_idx').on(table.referenceType, table.referenceId),
    directionIdx: index('cash_ledger_direction_idx').on(table.direction),
  })
);

export type CashLedgerRow = typeof cashLedger.$inferSelect;
export type NewCashLedgerRow = typeof cashLedger.$inferInsert;
