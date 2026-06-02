import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { auditLogs } from '../../../db/schema.js';
import { cashLedger } from '../../cash-ledger/cash-ledger.schema.js';
import { vehicles } from '../../vehicles/vehicle.schema.js';
import { vehicleExchangeHistory } from '../schemas/vehicle-exchange.schema.js';
import type { CreateVehicleExchangeDto, ExchangeReportQueryDto } from '../dto/vehicle-exchange.dto.js';

type DbClient = typeof db;

function exchangeFilters(query: ExchangeReportQueryDto = {}) {
  const filters = [] as any[];
  if (query.fromDate) filters.push(gte(vehicleExchangeHistory.exchangeDate, query.fromDate));
  if (query.toDate) filters.push(lte(vehicleExchangeHistory.exchangeDate, query.toDate));
  return filters.length ? and(...filters) : undefined;
}

export const vehicleExchangeRepository = {
  async findVehicle(id: number, client: DbClient = db) {
    const [row] = await client.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return row ?? null;
  },

  async markOldVehicleExchanged(oldVehicleId: number, client: DbClient = db) {
    const [updated] = await client
      .update(vehicles)
      .set({ status: 'EXCHANGED', updatedAt: new Date() })
      .where(eq(vehicles.id, oldVehicleId))
      .returning();
    return updated ?? null;
  },

  async createNewVehicle(input: CreateVehicleExchangeDto['newVehicle'], client: DbClient = db) {
    const [created] = await client
      .insert(vehicles)
      .values({
        vehicleName: input.vehicleName,
        brand: input.brand,
        variant: input.variant,
        modelYear: input.modelYear,
        fuelType: input.fuelType,
        transmission: input.transmission,
        color: input.color,
        kmDriven: input.kmDriven,
        ownershipCount: input.ownershipCount,
        insuranceStatus: input.insuranceStatus,
        askingPrice: input.askingPrice,
        purchasePrice: input.purchasePrice,
        purchaseAmount: input.purchasePrice,
        currentValue: input.askingPrice,
        description: input.description,
        status: input.status || 'ACTIVE',
        isSold: false,
        soldPrice: null,
        documents: input.documents,
      })
      .returning();
    return created;
  },

  async createHistory(oldVehicleId: number, newVehicleId: number, input: CreateVehicleExchangeDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(vehicleExchangeHistory)
      .values({
        oldVehicleId,
        newVehicleId,
        exchangeValue: input.exchangeValue,
        additionalPaid: input.additionalPaid,
        exchangeDate: input.exchangeDate,
        remarks: input.remarks ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async createCashLedger(historyId: number, input: CreateVehicleExchangeDto, createdBy: number, client: DbClient = db) {
    if (input.additionalPaid <= 0) return null;
    const [created] = await client
      .insert(cashLedger)
      .values({
        ledgerDate: input.exchangeDate,
        module: 'VEHICLE_EXCHANGE',
        referenceType: 'vehicle_exchange_history',
        referenceId: historyId,
        direction: 'OUT',
        amount: input.additionalPaid,
        paymentMode: input.paymentMode,
        notes: input.remarks ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async createAudit(oldVehicleId: number, newVehicleId: number, historyId: number, createdBy: number, client: DbClient = db) {
    await client.insert(auditLogs).values({
      action: 'vehicles.exchanged',
      actorUserId: createdBy,
      targetUserId: null,
      ipAddress: null,
      userAgent: null,
      metadata: JSON.stringify({ oldVehicleId, newVehicleId, exchangeHistoryId: historyId }),
    });
  },

  list(query: ExchangeReportQueryDto = {}) {
    return db
      .select()
      .from(vehicleExchangeHistory)
      .where(exchangeFilters(query))
      .orderBy(desc(vehicleExchangeHistory.exchangeDate), desc(vehicleExchangeHistory.id));
  },
};
