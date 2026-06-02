import { db } from '../../../db';
import { vehicleExchangeRepository } from '../repositories/vehicle-exchange.repository';
import type { CreateVehicleExchangeDto, ExchangeReportQueryDto } from '../dto/vehicle-exchange.dto';

export const vehicleExchangeService = {
  async exchange(input: CreateVehicleExchangeDto, createdBy: number) {
    return db.transaction(async (tx) => {
      const oldVehicle = await vehicleExchangeRepository.findVehicle(input.oldVehicleId, tx as any);
      if (!oldVehicle) throw Object.assign(new Error('Old vehicle not found'), { code: 'OLD_VEHICLE_NOT_FOUND' });

      await vehicleExchangeRepository.markOldVehicleExchanged(input.oldVehicleId, tx as any);
      const newVehicle = await vehicleExchangeRepository.createNewVehicle(input.newVehicle, tx as any);
      const history = await vehicleExchangeRepository.createHistory(input.oldVehicleId, newVehicle.id, input, createdBy, tx as any);
      const ledger = await vehicleExchangeRepository.createCashLedger(history.id, input, createdBy, tx as any);
      await vehicleExchangeRepository.createAudit(input.oldVehicleId, newVehicle.id, history.id, createdBy, tx as any);

      return { oldVehicleId: input.oldVehicleId, newVehicle, history, ledger };
    });
  },

  list(query?: ExchangeReportQueryDto) {
    return vehicleExchangeRepository.list(query);
  },
};
