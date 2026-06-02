import { index, integer, numeric, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { vehicles } from '../../vehicles/vehicle.schema.js';

export const vehicleSalePaymentStatusEnum = pgEnum('vehicle_sale_payment_status', ['PENDING', 'PARTIAL', 'PAID']);

export const vehicleSales = pgTable(
  'vehicle_sales',
  {
    id: serial('id').primaryKey(),
    vehicleId: integer('vehicleId')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    saleDate: timestamp('saleDate').notNull(),
    saleAmount: numeric('saleAmount', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    buyerName: varchar('buyerName', { length: 200 }).notNull(),
    paymentStatus: vehicleSalePaymentStatusEnum('paymentStatus').notNull().default('PENDING'),
    notes: text('notes'),
  },
  (table) => ({
    vehicleIdx: index('vehicle_sales_vehicle_idx').on(table.vehicleId),
    saleDateIdx: index('vehicle_sales_sale_date_idx').on(table.saleDate),
  })
);

export type VehicleSaleRow = typeof vehicleSales.$inferSelect;
export type NewVehicleSaleRow = typeof vehicleSales.$inferInsert;
