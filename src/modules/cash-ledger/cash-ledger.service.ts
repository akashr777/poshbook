import { cashLedgerRepository } from './cash-ledger.repository.js';
import type { CashLedgerCreateInput, CashLedgerReportQuery } from './cash-ledger.types.js';

export const cashLedgerService = {
  create(input: CashLedgerCreateInput, client?: any) {
    return cashLedgerRepository.create(input, client);
  },

  recent(limit?: number) {
    return cashLedgerRepository.recent(limit);
  },

  cashPosition(query?: CashLedgerReportQuery) {
    return cashLedgerRepository.cashPosition(query);
  },

  cashFlow(query?: CashLedgerReportQuery) {
    return cashLedgerRepository.cashFlow(query);
  },
};
