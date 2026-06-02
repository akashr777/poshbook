import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../../db';
import { vendors, type VendorRow } from './vendor.schema';
import type { VendorsQueryInput, VendorStatus, VendorUpdateInput, VendorCreateInput } from './vendor.types';

export const vendorRepository = {
  async findById(id: number): Promise<VendorRow | null> {
    const [row] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    return row ?? null;
  },

  async findByVendorCode(vendorCode: string): Promise<VendorRow | null> {
    const [row] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorCode, vendorCode))
      .limit(1);
    return row ?? null;
  },

  async list(query: VendorsQueryInput): Promise<{ items: VendorRow[]; total: number }> {
    const { page, pageSize, search, status, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const whereFilters = [] as any[];

    if (status) whereFilters.push(eq(vendors.status, status));

    if (search) {
      whereFilters.push(
        or(
          ilike(vendors.name, `%${search}%`),
          ilike(vendors.vendorCode, `%${search}%`),
          ilike(vendors.phone, `%${search}%`),
          ilike(vendors.email, `%${search}%`)
        )
      );
    }

    const where = whereFilters.length ? and(...whereFilters) : undefined;

    const orderExpr =
      sortOrder === 'asc'
        ? asc(
            sortBy === 'name'
              ? vendors.name
              : sortBy === 'vendorCode'
                ? vendors.vendorCode
                : vendors.createdAt
          )
        : desc(
            sortBy === 'name'
              ? vendors.name
              : sortBy === 'vendorCode'
                ? vendors.vendorCode
                : vendors.createdAt
          );

    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(vendors)
        .where(where)
        .orderBy(orderExpr)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(vendors).where(where),
    ]);

    return { items, total: Number(totalRow[0]?.total ?? 0) };
  },

  async create(input: VendorCreateInput): Promise<VendorRow> {
    const [created] = await db
      .insert(vendors)
      .values({
        vendorCode: input.vendorCode,
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        gstNumber: input.gstNumber ?? null,
        notes: input.notes ?? null,
        status: input.status ?? 'active',
      })
      .returning();

    return created;
  },

  async update(id: number, patch: VendorUpdateInput): Promise<VendorRow | null> {
    const [updated] = await db
      .update(vendors)
      .set({
        ...(patch.vendorCode !== undefined ? { vendorCode: patch.vendorCode } : {}),
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.email !== undefined ? { email: patch.email } : {}),
        ...(patch.address !== undefined ? { address: patch.address } : {}),
        ...(patch.gstNumber !== undefined ? { gstNumber: patch.gstNumber } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id))
      .returning();

    return updated ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id)).returning({ id: vendors.id });
    return result.length > 0;
  },
};

