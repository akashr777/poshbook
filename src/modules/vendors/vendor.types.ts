import type { z } from 'zod';
import type { VendorRow } from './vendor.schema.js';

export type VendorStatus = 'active' | 'inactive';

export type VendorCreateInput = {
  vendorCode: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  status?: VendorStatus;
};

export type VendorUpdateInput = {
  vendorCode?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  status?: VendorStatus;
};

export type VendorsQueryInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: VendorStatus;
  sortBy: 'name' | 'vendorCode' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};

export type VendorListResult = {
  items: VendorRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

