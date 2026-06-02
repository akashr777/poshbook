import { index, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { vehicles } from '../../vehicles/vehicle.schema.js';

export const vehicleExchangeHistory = pgTable(
  'vehicle_exchange_history',
  {
    id: serial('id').primaryKey(),
    oldVehicleId: integer('oldVehicleId')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'restrict' }),
    newVehicleId: integer('newVehicleId')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'restrict' }),
    exchangeValue: numeric('exchangeValue', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    additionalPaid: numeric('additionalPaid', { precision: 14, scale: 2, mode: 'number' }).notNull().default(0),
    exchangeDate: timestamp('exchangeDate').notNull(),
    remarks: text('remarks'),
    createdBy: integer('createdBy').notNull(),
  },
  (table) => ({
    oldVehicleIdx: index('vehicle_exchange_old_vehicle_idx').on(table.oldVehicleId),
    newVehicleIdx: index('vehicle_exchange_new_vehicle_idx').on(table.newVehicleId),
    exchangeDateIdx: index('vehicle_exchange_date_idx').on(table.exchangeDate),
  })
);

export type VehicleExchangeHistoryRow = typeof vehicleExchangeHistory.$inferSelect;
export type NewVehicleExchangeHistoryRow = typeof vehicleExchangeHistory.$inferInsert;
