import { cashLedgerService } from '../../cash-ledger/index.js';
import { expenseService } from '../../expenses/index.js';
import { funderService } from '../../funders/index.js';
import { salaryService } from '../../salaries/index.js';
import { vehicleAccountingService } from '../../vehicle-accounting/index.js';
import { vendorLedgerService } from '../../vendor-ledger/index.js';

export const dashboardService = {
  async summary() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      funders,
      vendors,
      monthlyExpenses,
      salaryExpense,
      vehicleAssets,
      cashPosition,
      recentTransactions,
      recentVehicleActivities,
    ] = await Promise.all([
      funderService.aggregate(),
      vendorLedgerService.aggregateDue(),
      expenseService.aggregate({ fromDate: monthStart, toDate: nextMonth }),
      salaryService.aggregate({ fromDate: monthStart, toDate: nextMonth }),
      vehicleAccountingService.assetValue(),
      cashLedgerService.cashPosition(),
      cashLedgerService.recent(10),
      vehicleAccountingService.recentActivities(10),
    ]);

    return {
      totalFundedAmount: funders.totalFunded,
      outstandingFunderBalance: funders.outstanding,
      totalVendorDue: vendors.pendingAmount,
      monthlyExpenses: monthlyExpenses.totalExpenses,
      vehicleAssetValue: vehicleAssets.vehicleAssetValue,
      salaryExpense: salaryExpense.totalSalaryExpense,
      netCashPosition: cashPosition.netCashPosition,
      recentTransactions,
      recentVehicleActivities,
    };
  },
};
