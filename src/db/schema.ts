import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Module Imports
import { vehicles, vehicleStatusEnum } from '../modules/vehicles/vehicle.schema';
import { daybookEntries, daybookEntryTypeEnum } from '../modules/daybook/daybook.schema';
import { vendors, vendorStatusEnum } from '../modules/vendors/vendor.schema';
import {
  cashLedger,
  cashLedgerDirectionEnum,
  cashLedgerModuleEnum,
} from '../modules/cash-ledger/cash-ledger.schema';
import { funders, funderTransactions, funderStatusEnum, funderTransactionTypeEnum } from '../modules/funders/schemas/funder.schema';
import { vendorPayments, vendorPurchases } from '../modules/vendor-ledger/schemas/vendor-ledger.schema';
import { expenseCategories, expenses, expenseTypeEnum, expenseCategoryStatusEnum } from '../modules/expenses/schemas/expense.schema';
import { salaryExpenses } from '../modules/salaries/schemas/salary.schema';
import {
  vehicleSalePaymentStatusEnum,
  vehicleSales,
} from '../modules/vehicle-accounting/schemas/vehicle-accounting.schema';
import { vehicleExchangeHistory } from '../modules/vehicle-exchange/schemas/vehicle-exchange.schema';

/* ---------------------------------- */
/* User Enums */
/* ---------------------------------- */

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'user',
  'staff',
  'partner',
  'funder',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
]);

/* ---------------------------------- */
/* Users */
/* ---------------------------------- */

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('staff').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('createdAt').notNull().default(sql`now()`),
});

/* ---------------------------------- */
/* Refresh Sessions */
/* ---------------------------------- */

export const refreshSessions = pgTable('refresh_sessions', {
  id: serial('id').primaryKey(),
  jti: varchar('jti', { length: 64 }).notNull().unique(),
  userId: integer('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
  revokedAt: timestamp('revokedAt'),
  createdAt: timestamp('createdAt').notNull().default(sql`now()`),
});

/* ---------------------------------- */
/* Password Reset Tokens */
/* ---------------------------------- */

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('tokenHash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  usedAt: timestamp('usedAt'),
  createdAt: timestamp('createdAt').notNull().default(sql`now()`),
});

/* ---------------------------------- */
/* Audit Logs */
/* ---------------------------------- */

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 64 }).notNull(),
  actorUserId: integer('actorUserId'),
  targetUserId: integer('targetUserId'),
  ipAddress: varchar('ipAddress', { length: 64 }),
  userAgent: varchar('userAgent', { length: 512 }),
  metadata: text('metadata'),
  createdAt: timestamp('createdAt').notNull().default(sql`now()`),
});

/* ---------------------------------- */
/* Exports */
/* ---------------------------------- */

// Primary exports
export {
  vehicles,
  daybookEntries,
  vendors,
  funders,
  funderTransactions,
  vendorPurchases,
  vendorPayments,
  expenseCategories,
  expenses,
  salaryExpenses,
  vehicleSales,
  vehicleExchangeHistory,
  cashLedger,
  cashLedgerDirectionEnum,
  cashLedgerModuleEnum,
};

// Enums and additional exports
export {
  vehicleStatusEnum,
  daybookEntryTypeEnum,
  vendorStatusEnum,
  funderStatusEnum,
  funderTransactionTypeEnum,
  expenseTypeEnum,
  expenseCategoryStatusEnum,
  vehicleSalePaymentStatusEnum,
};

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

export type UserRow = typeof users.$inferSelect;
export type RefreshSessionRow = typeof refreshSessions.$inferSelect;
export type PasswordResetTokenRow = typeof passwordResetTokens.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type VehicleRow = typeof vehicles.$inferSelect;
export type DaybookEntryRow = typeof daybookEntries.$inferSelect;
export type FunderRow = typeof funders.$inferSelect;
export type FunderTransactionRow = typeof funderTransactions.$inferSelect;
export type VendorPurchaseRow = typeof vendorPurchases.$inferSelect;
export type VendorPaymentRow = typeof vendorPayments.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type SalaryExpenseRow = typeof salaryExpenses.$inferSelect;