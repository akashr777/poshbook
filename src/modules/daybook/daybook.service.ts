import { db } from '../../db/index.js';
import { daybookRepository } from './daybook.repository.js';
import type {
  CreateDaybookEntryInput,
  ListDaybookQuery,
  MonthlyReportQuery,
  ReportQuery,
  UpdateDaybookEntryInput,
} from './daybook.types.js';

function normalizeAmounts<T extends { entryType: 'debit' | 'credit'; debitAmount?: number; creditAmount?: number }>(
  input: T
) {
  return {
    ...input,
    debitAmount: input.entryType === 'debit' ? Number(input.debitAmount ?? 0) : 0,
    creditAmount: input.entryType === 'credit' ? Number(input.creditAmount ?? 0) : 0,
  };
}

function assertValidAmounts(input: { entryType: 'debit' | 'credit'; debitAmount: number; creditAmount: number }) {
  if (input.entryType === 'debit' && (input.debitAmount <= 0 || input.creditAmount !== 0)) {
    const error = new Error('Invalid debit entry amounts') as Error & { code?: string };
    error.code = 'INVALID_DAYBOOK_AMOUNTS';
    throw error;
  }

  if (input.entryType === 'credit' && (input.creditAmount <= 0 || input.debitAmount !== 0)) {
    const error = new Error('Invalid credit entry amounts') as Error & { code?: string };
    error.code = 'INVALID_DAYBOOK_AMOUNTS';
    throw error;
  }
}

function notFound(code: string, message: string) {
  const error = new Error(message) as Error & { code?: string };
  error.code = code;
  return error;
}

export const daybookService = {
  async createEntry(input: CreateDaybookEntryInput, createdBy: number) {
    const normalized = normalizeAmounts(input);
    assertValidAmounts(normalized);

    return db.transaction(async (tx) => {
      const vehicleExists = await daybookRepository.vehicleExists(normalized.vehicleId, tx as any);
      if (!vehicleExists) {
        throw notFound('VEHICLE_NOT_FOUND', 'Vehicle not found');
      }

      return daybookRepository.create(normalized, createdBy, tx as any);
    });
  },

  async updateEntry(id: number, input: UpdateDaybookEntryInput) {
    const existing = await daybookRepository.findById(id);
    if (!existing) return null;

    const merged = normalizeAmounts({
      ...existing,
      ...input,
      entryType: input.entryType ?? existing.entryType,
      debitAmount: input.debitAmount ?? existing.debitAmount,
      creditAmount: input.creditAmount ?? existing.creditAmount,
      entryDate: input.entryDate ?? existing.entryDate,
    });

    assertValidAmounts(merged);

    return db.transaction(async (tx) => {
      if (input.vehicleId) {
        const vehicleExists = await daybookRepository.vehicleExists(input.vehicleId, tx as any);
        if (!vehicleExists) {
          throw notFound('VEHICLE_NOT_FOUND', 'Vehicle not found');
        }
      }

      return daybookRepository.update(id, {
        ...input,
        entryType: merged.entryType,
        debitAmount: merged.debitAmount,
        creditAmount: merged.creditAmount,
      }, tx as any);
    });
  },

  async deleteEntry(id: number) {
    return db.transaction((tx) => daybookRepository.delete(id, tx as any));
  },

  getEntry(id: number) {
    return daybookRepository.findById(id);
  },

  listEntries(query: ListDaybookQuery) {
    return daybookRepository.list(query);
  },

  getDashboardSummary() {
    return daybookRepository.dashboardSummary();
  },

  getVehicleSummaries() {
    return daybookRepository.vehicleFinancialSummaries();
  },

  getVehicleLedger(vehicleId: number) {
    return daybookRepository.vehicleLedger(vehicleId);
  },

  getDailyLedger(query: ReportQuery) {
    return daybookRepository.dailyLedger(query);
  },

  getMonthlyReport(query: MonthlyReportQuery) {
    return daybookRepository.monthlyReport(query);
  },

  getProfitReport(query: ReportQuery) {
    return daybookRepository.totals(query);
  },
};
