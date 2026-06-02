import { cashLedgerService } from '../../cash-ledger';
import { expenseService } from '../../expenses';
import { funderService } from '../../funders';
import { salaryService } from '../../salaries';
import { vehicleAccountingService } from '../../vehicle-accounting';
import { vendorLedgerService } from '../../vendor-ledger';

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
