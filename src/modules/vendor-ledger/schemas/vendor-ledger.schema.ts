import { index, integer, numeric, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { vehicles } from '../../vehicles/vehicle.schema';
import { vendors } from '../../vendors/vendor.schema';

export const vendorPurchases = pgTable(
  'vendor_purchases',
  {
    id: serial('id').primaryKey(),
    vendorId: integer('vendorId')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    vehicleId: integer('vehicleId').references(() => vehicles.id, { onDelete: 'set null' }),
    purchaseDate: timestamp('purchaseDate').notNull(),
    invoiceNo: varchar('invoiceNo', { length: 100 }),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    notes: text('notes'),
    createdBy: integer('createdBy').notNull(),
  },
  (table) => ({
    vendorIdx: index('vendor_purchases_vendor_idx').on(table.vendorId),
    vehicleIdx: index('vendor_purchases_vehicle_idx').on(table.vehicleId),
    dateIdx: index('vendor_purchases_date_idx').on(table.purchaseDate),
  })
);

export const vendorPayments = pgTable(
  'vendor_payments',
  {
    id: serial('id').primaryKey(),
    vendorId: integer('vendorId')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    paidDate: timestamp('paidDate').notNull(),
    paymentMode: varchar('paymentMode', { length: 80 }).notNull(),
    notes: text('notes'),
    createdBy: integer('createdBy').notNull(),
  },
  (table) => ({
    vendorIdx: index('vendor_payments_vendor_idx').on(table.vendorId),
    paidDateIdx: index('vendor_payments_paid_date_idx').on(table.paidDate),
  })
);

export type VendorPurchaseRow = typeof vendorPurchases.$inferSelect;
export type NewVendorPurchaseRow = typeof vendorPurchases.$inferInsert;
export type VendorPaymentRow = typeof vendorPayments.$inferSelect;
export type NewVendorPaymentRow = typeof vendorPayments.$inferInsert;
