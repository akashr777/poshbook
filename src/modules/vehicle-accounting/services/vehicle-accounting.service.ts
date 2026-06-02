import { db } from '../../../db';
import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository';
import { vehicleAccountingRepository } from '../repositories/vehicle-accounting.repository';
import type { CreateVehicleSaleDto } from '../dto/vehicle-accounting.dto';

export const vehicleAccountingService = {
  async createSale(vehicleId: number, input: CreateVehicleSaleDto, createdBy: number) {
    return db.transaction(async (tx) => {
      if (!(await vehicleAccountingRepository.vehicleExists(vehicleId, tx as any))) {
        throw Object.assign(new Error('Vehicle not found'), { code: 'VEHICLE_NOT_FOUND' });
      }

      const sale = await vehicleAccountingRepository.createSale(vehicleId, input, tx as any);
      await vehicleAccountingRepository.markSold(vehicleId, input.saleAmount, tx as any);
      await cashLedgerRepository.create(
        {
          ledgerDate: input.saleDate,
          module: 'VEHICLES',
          referenceType: 'vehicle_sales',
          referenceId: sale.id,
          direction: 'IN',
          amount: input.saleAmount,
          paymentMode: input.paymentMode,
          notes: input.notes ?? null,
          createdBy,
        },
        tx as any
      );
      return sale;
    });
  },

  recentActivities(limit?: number) {
    return vehicleAccountingRepository.recentActivities(limit);
  },

  assetValue() {
    return vehicleAccountingRepository.assetValue();
  },
};
