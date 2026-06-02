import { cashLedgerService } from '../../cash-ledger/index.js';
import { expenseService } from '../../expenses/index.js';
import { funderService } from '../../funders/index.js';
import { salaryService } from '../../salaries/index.js';
import { vehicleAccountingService } from '../../vehicle-accounting/index.js';
import { vehicleExchangeService } from '../../vehicle-exchange/index.js';
import { vendorLedgerService } from '../../vendor-ledger/index.js';
import type { ReportQueryDto } from '../dto/report.dto.js';

export const reportService = {
  funders() {
    return funderService.aggregate();
  },

  vendors() {
    return vendorLedgerService.aggregateDue();
  },

  expenses(query: ReportQueryDto) {
    return expenseService.list(query);
  },

  salaries(query: ReportQueryDto) {
    return salaryService.list(query);
  },

  vehicles() {
    return vehicleAccountingService.assetValue();
  },

  exchanges(query: ReportQueryDto) {
    return vehicleExchangeService.list(query);
  },

  async profitLoss(query: ReportQueryDto) {
    const [cash, expenses, salaries] = await Promise.all([
      cashLedgerService.cashPosition(query),
      expenseService.aggregate(query),
      salaryService.aggregate(query),
    ]);
    return {
      revenue: cash.cashIn,
      expenses: expenses.totalExpenses + salaries.totalSalaryExpense,
      netProfit: cash.cashIn - cash.cashOut,
      cashOut: cash.cashOut,
    };
  },

  cashFlow(query: ReportQueryDto) {
    return cashLedgerService.cashFlow(query);
  },
};
