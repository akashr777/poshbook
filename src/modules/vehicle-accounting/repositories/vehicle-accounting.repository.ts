import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { vehicles } from '../../vehicles/vehicle.schema.js';
import { vehicleSales } from '../schemas/vehicle-accounting.schema.js';
import type { CreateVehicleSaleDto } from '../dto/vehicle-accounting.dto.js';

type DbClient = typeof db;

export const vehicleAccountingRepository = {
  async vehicleExists(vehicleId: number, client: DbClient = db) {
    const [row] = await client.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
    return Boolean(row);
  },

  async createSale(vehicleId: number, input: CreateVehicleSaleDto, client: DbClient = db) {
    const [created] = await client
      .insert(vehicleSales)
      .values({
        vehicleId,
        saleDate: input.saleDate,
        saleAmount: input.saleAmount,
        buyerName: input.buyerName,
        paymentStatus: input.paymentStatus,
        notes: input.notes ?? null,
      })
      .returning();
    return created;
  },

  async markSold(vehicleId: number, saleAmount: number, client: DbClient = db) {
    const [updated] = await client
      .update(vehicles)
      .set({ status: 'SOLD', isSold: true, soldPrice: saleAmount, updatedAt: new Date() })
      .where(eq(vehicles.id, vehicleId))
      .returning();
    return updated ?? null;
  },

  recentActivities(limit = 10) {
    return db.select().from(vehicleSales).orderBy(desc(vehicleSales.saleDate), desc(vehicleSales.id)).limit(limit);
  },

  async assetValue() {
    const [row] = await db
      .select({
        vehicleAssetValue: sql<number>`coalesce(sum(coalesce(${vehicles.currentValue}, ${vehicles.purchaseAmount}, ${vehicles.purchasePrice})), 0)`,
      })
      .from(vehicles)
      .where(sql`${vehicles.status} in ('available', 'booked', 'ACTIVE')`);
    return { vehicleAssetValue: Number(row?.vehicleAssetValue ?? 0) };
  },
};
