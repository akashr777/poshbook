import { z } from 'zod';

import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema
} from './vehicle.validation.js';

export type VehicleStatus = 'available' | 'booked' | 'sold' | 'hidden' | 'ACTIVE' | 'SOLD' | 'EXCHANGED';

export type VehicleCreateInput = z.infer<typeof createVehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof updateVehicleSchema>;
export type VehicleListQuery = z.infer<typeof listVehiclesQuerySchema>;

export type VehicleSortBy = VehicleListQuery['sortBy'];

// FIXED: Change id from string to number to match serial type in database
export type VehicleDocumentHolder = {
  available: boolean;
  holder: string;
};

export type VehicleDocuments = {
  rc: VehicleDocumentHolder;
  noc: VehicleDocumentHolder;
  insurance: VehicleDocumentHolder;
  pollution: VehicleDocumentHolder;
  bankNoc: VehicleDocumentHolder;
  secondKey: VehicleDocumentHolder;
};

export type VehicleRecord = {
  id: string;
  vehicleName: string;
  brand: string;
  variant: string;
  modelYear: string;
  fuelType: string;
  transmission: string;
  color: string;
  kmDriven: number;
  ownershipCount: number;
  insuranceStatus: string;
  askingPrice: number;
  purchasePrice: number;
  description: string;
  status: VehicleStatus;
  isSold: boolean;
  soldPrice: number | null;
  documents: VehicleDocuments;
  createdAt: Date;
  updatedAt: Date;
};

export type VehicleListResult = {
  items: VehicleRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
