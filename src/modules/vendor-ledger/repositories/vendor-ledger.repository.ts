import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { vendors } from '../../vendors/vendor.schema.js';
import { vendorPayments, vendorPurchases } from '../schemas/vendor-ledger.schema.js';
import type { CreateVendorPaymentDto, CreateVendorPurchaseDto, VendorLedgerQueryDto } from '../dto/vendor-ledger.dto.js';

type DbClient = typeof db;

function purchaseFilters(vendorId: number, query: VendorLedgerQueryDto = {}) {
  const filters = [eq(vendorPurchases.vendorId, vendorId)] as any[];
  if (query.fromDate) filters.push(gte(vendorPurchases.purchaseDate, query.fromDate));
  if (query.toDate) filters.push(lte(vendorPurchases.purchaseDate, query.toDate));
  return and(...filters);
}

function paymentFilters(vendorId: number, query: VendorLedgerQueryDto = {}) {
  const filters = [eq(vendorPayments.vendorId, vendorId)] as any[];
  if (query.fromDate) filters.push(gte(vendorPayments.paidDate, query.fromDate));
  if (query.toDate) filters.push(lte(vendorPayments.paidDate, query.toDate));
  return and(...filters);
}

export const vendorLedgerRepository = {
  async vendorExists(vendorId: number, client: DbClient = db) {
    const [row] = await client.select({ id: vendors.id }).from(vendors).where(eq(vendors.id, vendorId)).limit(1);
    return Boolean(row);
  },

  async createPurchase(vendorId: number, input: CreateVendorPurchaseDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(vendorPurchases)
      .values({
        vendorId,
        vehicleId: input.vehicleId ?? null,
        purchaseDate: input.purchaseDate,
        invoiceNo: input.invoiceNo ?? null,
        amount: input.amount,
        notes: input.notes ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async createPayment(vendorId: number, input: CreateVendorPaymentDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(vendorPayments)
      .values({
        vendorId,
        amount: input.amount,
        paidDate: input.paidDate,
        paymentMode: input.paymentMode,
        notes: input.notes ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async ledger(vendorId: number, query: VendorLedgerQueryDto = {}) {
    const [purchaseSummary, paymentSummary, purchases, payments] = await Promise.all([
      db
        .select({ totalPurchases: sql<number>`coalesce(sum(${vendorPurchases.amount}), 0)` })
        .from(vendorPurchases)
        .where(purchaseFilters(vendorId, query)),
      db
        .select({ totalPaid: sql<number>`coalesce(sum(${vendorPayments.amount}), 0)` })
        .from(vendorPayments)
        .where(paymentFilters(vendorId, query)),
      db.select().from(vendorPurchases).where(purchaseFilters(vendorId, query)).orderBy(asc(vendorPurchases.purchaseDate)),
      db.select().from(vendorPayments).where(paymentFilters(vendorId, query)).orderBy(asc(vendorPayments.paidDate)),
    ]);

    const totalPurchases = Number(purchaseSummary[0]?.totalPurchases ?? 0);
    const totalPaid = Number(paymentSummary[0]?.totalPaid ?? 0);
    return {
      purchases,
      payments,
      summary: {
        totalPurchases,
        totalPaid,
        pendingAmount: totalPurchases - totalPaid,
      },
    };
  },

  async aggregateDue() {
    const [purchasesRow, paymentsRow] = await Promise.all([
      db.select({ totalPurchases: sql<number>`coalesce(sum(${vendorPurchases.amount}), 0)` }).from(vendorPurchases),
      db.select({ totalPaid: sql<number>`coalesce(sum(${vendorPayments.amount}), 0)` }).from(vendorPayments),
    ]);
    const totalPurchases = Number(purchasesRow[0]?.totalPurchases ?? 0);
    const totalPaid = Number(paymentsRow[0]?.totalPaid ?? 0);
    return { totalPurchases, totalPaid, pendingAmount: totalPurchases - totalPaid };
  },
};
