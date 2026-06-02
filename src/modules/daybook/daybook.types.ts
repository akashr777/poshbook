import type { z } from 'zod';
import type {
  createDaybookEntrySchema,
  listDaybookQuerySchema,
  monthlyReportQuerySchema,
  reportQuerySchema,
  updateDaybookEntrySchema,
} from './daybook.validation.js';
import type { DaybookEntryRow } from './daybook.schema.js';

export type DaybookEntryType = 'debit' | 'credit';

export type CreateDaybookEntryInput = z.infer<typeof createDaybookEntrySchema>;
export type UpdateDaybookEntryInput = z.infer<typeof updateDaybookEntrySchema>;
export type ListDaybookQuery = z.infer<typeof listDaybookQuerySchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;

export type DaybookEntryRecord = DaybookEntryRow & {
  vehicleName?: string | null;
  brand?: string | null;
  variant?: string | null;
};

export type FinancialTotals = {
  totalDebit: number;
  totalCredit: number;
  netProfit: number;
};

export type VehicleFinancialSummary = {
  vehicleId: number;
  vehicleName: string;
  brand: string | null;
  variant: string | null;
  askingPrice: number | null;
  soldPrice: number | null;
  status: string;
  totalDebit: number;
  totalCredit: number;
  totalExpense: number;
  totalIncome: number;
  netProfit: number;
  pendingAmount: number;
  entries: number;
};
