import { vendorRepository } from './vendor.repository';
import type { VendorsQueryInput, VendorCreateInput, VendorUpdateInput, VendorListResult } from './vendor.types';

export const vendorService = {
  async findById(id: number) {
    return vendorRepository.findById(id);
  },

  async list(query: VendorsQueryInput): Promise<VendorListResult> {
    const { items, total } = await vendorRepository.list(query);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    };
  },

  async create(input: VendorCreateInput) {
    const existing = await vendorRepository.findByVendorCode(input.vendorCode);
    if (existing) {
      throw Object.assign(new Error('Vendor code already exists'), { code: 'VENDOR_CODE_EXISTS' });
    }

    return vendorRepository.create(input);
  },

  async update(id: number, patch: VendorUpdateInput) {
    if (patch.vendorCode) {
      const existing = await vendorRepository.findByVendorCode(patch.vendorCode);
      if (existing && existing.id !== id) {
        throw Object.assign(new Error('Vendor code already exists'), { code: 'VENDOR_CODE_EXISTS' });
      }
    }

    return vendorRepository.update(id, patch);
  },

  async remove(id: number) {
    return vendorRepository.delete(id);
  },
};

