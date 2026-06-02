import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

import { sql } from 'drizzle-orm';

export const vendorStatusEnum = pgEnum('vendor_status', ['active', 'inactive']);

export const vendors = pgTable(
  'vendors',
  {
    id: serial('id').primaryKey(),

    vendorCode: varchar('vendorCode', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    email: varchar('email', { length: 320 }),
    address: text('address'),
    gstNumber: varchar('gstNumber', { length: 30 }),
    notes: text('notes'),

    status: vendorStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('createdAt').notNull().default(sql`now()`),
    updatedAt: timestamp('updatedAt').notNull().default(sql`now()`),
  },
  (table) => ({
    nameIdx: index('vendors_name_idx').on(table.name),
    vendorCodeIdx: index('vendors_vendorCode_idx').on(table.vendorCode),
    statusIdx: index('vendors_status_idx').on(table.status),
  })
);

export type VendorRow = typeof vendors.$inferSelect;
export type NewVendorRow = typeof vendors.$inferInsert;

