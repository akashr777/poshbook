// vehicle.repository.ts
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { vehicles } from './vehicle.schema.js';
import type { VehicleCreateInput, VehicleListQuery, VehicleRecord, VehicleSortBy, VehicleUpdateInput } from './vehicle.types.js';


function sortField(sortBy: VehicleSortBy) {
  switch (sortBy) {
    case 'askingPrice':
      return vehicles.askingPrice;
    case 'kmDriven':
      return vehicles.kmDriven;
    case 'vehicleName':
      return vehicles.vehicleName;
    case 'brand':
      return vehicles.brand;
    default:
      return vehicles.createdAt;
  }
}

export const vehicleRepository = {
  async createVehicle(input: VehicleCreateInput): Promise<VehicleRecord> {
    const [created] = await db
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
        description: input.description,
        status: input.status || 'available',
        isSold: input.status === 'sold',
        soldPrice: input.status === 'sold' ? (input.soldPrice ?? null) : null,
        documents: input.documents,
      })
      .returning();

    return {
      ...created,
      id: String(created.id),
    } as VehicleRecord;
  },

  async findVehicleById(id: string | number): Promise<VehicleRecord | null> {
    const numericId = parseInt(String(id), 10);
    if (isNaN(numericId)) return null;
    
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, numericId))
      .limit(1);
    
    if (!vehicle) return null;
    
    return {
      ...vehicle,
      id: String(vehicle.id),
    } as VehicleRecord;
  },

  async updateVehicle(id: string | number, patch: VehicleUpdateInput): Promise<VehicleRecord | null> {
    const numericId = parseInt(String(id), 10);
    if (isNaN(numericId)) return null;

    const updatePayload: any = {
      ...patch,
      updatedAt: new Date(),
    };

    if (patch.status === 'sold' || patch.status === 'SOLD') {
      updatePayload.isSold = true;
      updatePayload.soldPrice = patch.soldPrice ?? null;
    } else if (patch.status) {
      updatePayload.isSold = false;
      if (patch.soldPrice === undefined) {
        updatePayload.soldPrice = null;
      }
    }

    const [updated] = await db
      .update(vehicles)
      .set(updatePayload)
      .where(eq(vehicles.id, numericId))
      .returning();
    
    if (!updated) return null;
    
    return {
      ...updated,
      id: String(updated.id),
    } as VehicleRecord;
  },

  async deleteVehicle(id: string | number): Promise<boolean> {
    const numericId = parseInt(String(id), 10);
    if (isNaN(numericId)) return false;
    
    const result = await db
      .delete(vehicles)
      .where(eq(vehicles.id, numericId))
      .returning({ id: vehicles.id });
    
    return result.length > 0;
  },

  async listVehicles(query: VehicleListQuery): Promise<{ items: VehicleRecord[]; total: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const filters: any[] = [];
    
    if (query.search) {
      filters.push(
        or(
          ilike(vehicles.vehicleName, `%${query.search}%`),
          ilike(vehicles.brand, `%${query.search}%`),
          ilike(vehicles.variant, `%${query.search}%`)
        )
      );
    }
    if (query.brand) filters.push(eq(vehicles.brand, query.brand));
    if (query.fuelType) filters.push(eq(vehicles.fuelType, query.fuelType));
    if (query.transmission) filters.push(eq(vehicles.transmission, query.transmission));
    if (query.status) filters.push(eq(vehicles.status, query.status));

    const whereClause = filters.length ? and(...filters) : undefined;
    const orderExpr = query.sortOrder === 'asc' 
      ? asc(sortField(query.sortBy || 'createdAt')) 
      : desc(sortField(query.sortBy || 'createdAt'));

    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(vehicles)
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(vehicles).where(whereClause)
    ]);

    const itemsWithStringIds = items.map(item => ({
      ...item,
      id: String(item.id),
    }));

    return {
      items: itemsWithStringIds as VehicleRecord[],
      total: Number(totalRow[0]?.total ?? 0)
    };
  },

  async countSoldVehicles(): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(vehicles)
      .where(eq(vehicles.isSold, true));
    
    return Number(row?.total ?? 0);
  }
};
