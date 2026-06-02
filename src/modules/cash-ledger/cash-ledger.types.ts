import type { NewCashLedgerRow } from './cash-ledger.schema.js';

export type CashLedgerCreateInput = NewCashLedgerRow;

export type CashLedgerReportQuery = {
  fromDate?: Date;
  toDate?: Date;
};
