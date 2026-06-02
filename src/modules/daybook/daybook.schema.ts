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
import { vehicles } from '../vehicles/vehicle.schema.js';

export const daybookEntryTypeEnum = pgEnum('daybook_entry_type', ['debit', 'credit']);

export const daybookEntries = pgTable(
  'daybook_entries',
  {
    id: serial('id').primaryKey(),

    vehicleId: integer('vehicleId')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),

    entryType: daybookEntryTypeEnum('entryType').notNull(),

    category: varchar('category', { length: 120 }).notNull(),

    particular: varchar('particular', { length: 255 }).notNull(),

    debitAmount: numeric('debitAmount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),

    creditAmount: numeric('creditAmount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),

    paymentMode: varchar('paymentMode', { length: 80 }).notNull(),

    paidBy: varchar('paidBy', { length: 160 }).notNull(),

    paidTo: varchar('paidTo', { length: 160 }).notNull(),

    notes: text('notes'),

    entryDate: timestamp('entryDate').notNull(),

    createdBy: integer('createdBy').notNull(),

    createdAt: timestamp('createdAt')
      .notNull()
      .default(sql`now()`),

    updatedAt: timestamp('updatedAt')
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    vehicleIdx: index('daybook_entries_vehicle_idx').on(table.vehicleId),
    entryDateIdx: index('daybook_entries_entry_date_idx').on(table.entryDate),
    entryTypeIdx: index('daybook_entries_entry_type_idx').on(table.entryType),
    categoryIdx: index('daybook_entries_category_idx').on(table.category),
  })
);

export type DaybookEntryRow = typeof daybookEntries.$inferSelect;
export type NewDaybookEntryRow = typeof daybookEntries.$inferInsert;
