import {
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  pgEnum,
  serial,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const vehicleStatusEnum = pgEnum(
  'vehicle_status',
  [
    'available',
    'booked',
    'sold',
    'hidden',
    'ACTIVE',
    'SOLD',
    'EXCHANGED',
  ]
);

export const vehicles = pgTable(
  'vehicles',
  {
    id: serial('id').primaryKey(),

    vehicleNumber: varchar('vehicleNumber', { length: 80 }),

    chassisNumber: varchar('chassisNumber', { length: 120 }),

    vehicleName: varchar('vehicleName', { length: 200 }).notNull(),

    brand: varchar('brand', { length: 100 }).notNull(),

    variant: varchar('variant', { length: 150 }).notNull(),

    modelYear: varchar('modelYear', { length: 30 }).notNull(),

    fuelType: varchar('fuelType', { length: 50 }).notNull(),

    transmission: varchar('transmission', { length: 50 }).notNull(),

    color: varchar('color', { length: 100 }).notNull(),

    kmDriven: integer('kmDriven').notNull(),

    ownershipCount: integer('ownershipCount').notNull(),

    insuranceStatus: varchar('insuranceStatus', { length: 50 }).notNull(),

    askingPrice: numeric('askingPrice', { precision: 12, scale: 2, mode: 'number' }).notNull(),

    purchasePrice: numeric('purchasePrice', { precision: 12, scale: 2, mode: 'number' }).notNull(),

    purchaseDate: timestamp('purchaseDate'),

    purchaseAmount: numeric('purchaseAmount', { precision: 14, scale: 2, mode: 'number' }),

    currentValue: numeric('currentValue', { precision: 14, scale: 2, mode: 'number' }),

    description: text('description').notNull(),

    status: vehicleStatusEnum('status').notNull().default('available'),

    isSold: boolean('isSold').notNull().default(false),

    soldPrice: numeric('soldPrice', { precision: 12, scale: 2, mode: 'number' }),

    createdAt: timestamp('createdAt').notNull().default(sql`now()`),

    updatedAt: timestamp('updatedAt').notNull().default(sql`now()`),

    // Vehicle documents
    // RC, NOC, Insurance, Pollution, Bank NOC, Second Key
    // Stored as JSONB to allow flexible per-document fields.
    documents: jsonb('documents')
      .notNull()
      .default(sql`'{
        "rc": {"available": false, "holder": ""},
        "noc": {"available": false, "holder": ""},
        "insurance": {"available": false, "holder": ""},
        "pollution": {"available": false, "holder": ""},
        "bankNoc": {"available": false, "holder": ""},
        "secondKey": {"available": false, "holder": ""}
      }'::jsonb`),
  },
  (table) => ({
    vehicleNumberUnique: uniqueIndex('vehicles_vehicle_number_unique').on(table.vehicleNumber),
    chassisNumberUnique: uniqueIndex('vehicles_chassis_number_unique').on(table.chassisNumber),
  })
);

export type VehicleRow = typeof vehicles.$inferSelect;
export type NewVehicleRow = typeof vehicles.$inferInsert;
