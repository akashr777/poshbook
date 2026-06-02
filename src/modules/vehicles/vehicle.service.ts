import { auditFromContext } from '../audit';
import { vehicleRepository } from './vehicle.repository';
import type { VehicleCreateInput, VehicleListQuery, VehicleRecord, VehicleUpdateInput } from './vehicle.types';

export const vehicleService = {
  async createVehicle(input: VehicleCreateInput, actorId: string, context: any): Promise<VehicleRecord> {
    // Remove any id if present (let database auto-generate)
    const { id, ...cleanInput } = input as any;
    
    const vehicle = await vehicleRepository.createVehicle(cleanInput);
    
    // Convert the database record to match VehicleRecord type with string id
    const vehicleRecord: VehicleRecord = {
      ...vehicle,
      id: String(vehicle.id), // Convert number to string
    };
    
    await auditFromContext(context, {
      action: 'vehicles.created',
      actorUserId: Number(actorId),
      targetUserId: null,
      metadata: { vehicleId: vehicleRecord.id, brand: vehicle.brand }
    });
    
    return vehicleRecord;
  },

  async getVehicleById(id: string): Promise<VehicleRecord | null> {
    // Convert string id to number for database query
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    
    const vehicle = await vehicleRepository.findVehicleById(numericId);
    
    if (!vehicle) return null;
    
    // Convert to VehicleRecord type with string id
    return {
      ...vehicle,
      id: String(vehicle.id),
    };
  },

  async updateVehicle(id: string, patch: VehicleUpdateInput, actorId: string, context: any): Promise<VehicleRecord | null> {
    // Convert string id to number for database query
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    
    const existing = await vehicleRepository.findVehicleById(numericId);
    if (!existing) return null;

    // Remove id from patch if present
    const { id: _, ...cleanPatch } = patch as any;
    
    const updated = await vehicleRepository.updateVehicle(numericId, cleanPatch);
    
    if (updated) {
      await auditFromContext(context, {
        action: 'vehicles.updated',
        actorUserId: Number(actorId),
        targetUserId: null,
        metadata: { vehicleId: id, changedFields: Object.keys(cleanPatch) }
      });
      
      // Convert to VehicleRecord type with string id
      return {
        ...updated,
        id: String(updated.id),
      };
    }

    return null;
  },

  async removeVehicle(id: string, actorId: string, context: any): Promise<boolean> {
    // Convert string id to number for database query
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return false;
    
    const existing = await vehicleRepository.findVehicleById(numericId);
    if (!existing) return false;
    
    if (existing.status === 'sold' || existing.isSold) {
      const error = new Error('Sold vehicles cannot be deleted');
      Object.assign(error, { code: 'VEHICLE_SOLD_CANNOT_DELETE' });
      throw error;
    }

    const deleted = await vehicleRepository.deleteVehicle(numericId);
    
    if (deleted) {
      await auditFromContext(context, {
        action: 'vehicles.deleted',
        actorUserId: Number(actorId),
        targetUserId: null,
        metadata: { vehicleId: id }
      });
    }

    return deleted;
  },

  async listVehicles(query: VehicleListQuery): Promise<{ items: VehicleRecord[]; total: number }> {
    const result = await vehicleRepository.listVehicles(query);
    
    // Convert all database records to have string ids
    const itemsWithStringIds = result.items.map(vehicle => ({
      ...vehicle,
      id: String(vehicle.id),
    }));
    
    return {
      items: itemsWithStringIds,
      total: result.total
    };
  }
};