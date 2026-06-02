import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { vehicles } from '../vehicles/vehicle.schema.js';
import { daybookEntries } from './daybook.schema.js';
import type {
  CreateDaybookEntryInput,
  DaybookEntryRecord,
  ListDaybookQuery,
  MonthlyReportQuery,
  ReportQuery,
  UpdateDaybookEntryInput,
  VehicleFinancialSummary,
} from './daybook.types.js';

type DbClient = typeof db;

function listFilters(query: Partial<ListDaybookQuery>) {
  const filters = [] as any[];

  if (query.vehicleId) filters.push(eq(daybookEntries.vehicleId, query.vehicleId));
  if (query.entryType) filters.push(eq(daybookEntries.entryType, query.entryType));
  if (query.category) filters.push(eq(daybookEntries.category, query.category));
  if (query.paymentMode) filters.push(eq(daybookEntries.paymentMode, query.paymentMode));
  if (query.dateFrom) filters.push(gte(daybookEntries.entryDate, query.dateFrom));
  if (query.dateTo) filters.push(lte(daybookEntries.entryDate, query.dateTo));
  if (query.search) {
    filters.push(
      or(
        ilike(daybookEntries.particular, `%${query.search}%`),
        ilike(daybookEntries.category, `%${query.search}%`),
        ilike(daybookEntries.paidBy, `%${query.search}%`),
        ilike(daybookEntries.paidTo, `%${query.search}%`),
        ilike(vehicles.vehicleName, `%${query.search}%`),
        ilike(vehicles.brand, `%${query.search}%`),
        ilike(vehicles.variant, `%${query.search}%`)
      )
    );
  }

  return filters.length ? and(...filters) : undefined;
}

function money(value: unknown) {
  return Number(value ?? 0);
}

const entrySelect = {
  id: daybookEntries.id,
  vehicleId: daybookEntries.vehicleId,
  entryType: daybookEntries.entryType,
  category: daybookEntries.category,
  particular: daybookEntries.particular,
  debitAmount: daybookEntries.debitAmount,
  creditAmount: daybookEntries.creditAmount,
  paymentMode: daybookEntries.paymentMode,
  paidBy: daybookEntries.paidBy,
  paidTo: daybookEntries.paidTo,
  notes: daybookEntries.notes,
  entryDate: daybookEntries.entryDate,
  createdBy: daybookEntries.createdBy,
  createdAt: daybookEntries.createdAt,
  updatedAt: daybookEntries.updatedAt,
  vehicleName: vehicles.vehicleName,
  brand: vehicles.brand,
  variant: vehicles.variant,
};

export const daybookRepository = {
  async vehicleExists(vehicleId: number, client: DbClient = db) {
    const [row] = await client
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1);

    return Boolean(row);
  },

  async create(input: CreateDaybookEntryInput, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(daybookEntries)
      .values({
        ...input,
        notes: input.notes ?? null,
        createdBy,
      })
      .returning();

    return created;
  },

  async update(id: number, input: UpdateDaybookEntryInput, client: DbClient = db) {
    const [updated] = await client
      .update(daybookEntries)
      .set({
        ...input,
        notes: input.notes ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(daybookEntries.id, id))
      .returning();

    return updated ?? null;
  },

  async delete(id: number, client: DbClient = db) {
    const deleted = await client
      .delete(daybookEntries)
      .where(eq(daybookEntries.id, id))
      .returning({ id: daybookEntries.id });

    return deleted.length > 0;
  },

  async findById(id: number): Promise<DaybookEntryRecord | null> {
    const [entry] = await db
      .select(entrySelect)
      .from(daybookEntries)
      .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
      .where(eq(daybookEntries.id, id))
      .limit(1);

    return entry ?? null;
  },

  async list(query: ListDaybookQuery) {
    const offset = (query.page - 1) * query.pageSize;
    const where = listFilters(query);

    const [items, totalRow] = await Promise.all([
      db
        .select(entrySelect)
        .from(daybookEntries)
        .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
        .where(where)
        .orderBy(desc(daybookEntries.entryDate), desc(daybookEntries.createdAt))
        .limit(query.pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(daybookEntries)
        .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
        .where(where),
    ]);

    return {
      items,
      total: Number(totalRow[0]?.total ?? 0),
    };
  },

  async totals(query: ReportQuery = {}) {
    const where = listFilters(query);
    const [row] = await db
      .select({
        totalDebit: sql<number>`coalesce(sum(${daybookEntries.debitAmount}), 0)`,
        totalCredit: sql<number>`coalesce(sum(${daybookEntries.creditAmount}), 0)`,
        transactions: count(),
      })
      .from(daybookEntries)
      .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
      .where(where);

    const totalDebit = money(row?.totalDebit);
    const totalCredit = money(row?.totalCredit);

    return {
      totalDebit,
      totalCredit,
      netProfit: totalCredit - totalDebit,
      transactions: Number(row?.transactions ?? 0),
    };
  },

  async dashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [overall, todayTotals, monthTotals, vehicleSummaries] = await Promise.all([
      this.totals(),
      this.totals({ dateFrom: today, dateTo: tomorrow }),
      this.totals({ dateFrom: monthStart, dateTo: nextMonth }),
      this.vehicleFinancialSummaries(),
    ]);

    const pendingAmount = vehicleSummaries.reduce((sum, vehicle) => sum + vehicle.pendingAmount, 0);

    return {
      overallBusinessProfit: overall.netProfit,
      totalVehicleExpense: overall.totalDebit,
      totalVehicleIncome: overall.totalCredit,
      monthlyProfit: monthTotals.netProfit,
      monthlyDebit: monthTotals.totalDebit,
      monthlyCredit: monthTotals.totalCredit,
      dailyCashIn: todayTotals.totalCredit,
      dailyCashOut: todayTotals.totalDebit,
      dailyCashFlow: todayTotals.totalCredit - todayTotals.totalDebit,
      pendingAmount,
      totalTransactions: overall.transactions,
      activeVehicles: vehicleSummaries.length,
    };
  },

  mapVehicleFinancialSummary(row: {
    vehicleId: number;
    vehicleName: string;
    brand: string | null;
    variant: string | null;
    askingPrice: number | null;
    soldPrice: number | null;
    status: string;
    totalDebit: unknown;
    totalCredit: unknown;
    entries: unknown;
  }): VehicleFinancialSummary {
    const totalDebit = money(row.totalDebit);
    const totalCredit = money(row.totalCredit);
    const expectedIncome = money(row.soldPrice ?? row.askingPrice);

    return {
      vehicleId: row.vehicleId,
      vehicleName: row.vehicleName,
      brand: row.brand,
      variant: row.variant,
      askingPrice: row.askingPrice,
      soldPrice: row.soldPrice,
      status: row.status,
      totalDebit,
      totalCredit,
      totalExpense: totalDebit,
      totalIncome: totalCredit,
      netProfit: totalCredit - totalDebit,
      pendingAmount: Math.max(expectedIncome - totalCredit, 0),
      entries: Number(row.entries ?? 0),
    };
  },

  async vehicleFinancialSummaries(): Promise<VehicleFinancialSummary[]> {
    const rows = await db
      .select({
        vehicleId: vehicles.id,
        vehicleName: vehicles.vehicleName,
        brand: vehicles.brand,
        variant: vehicles.variant,
        askingPrice: vehicles.askingPrice,
        soldPrice: vehicles.soldPrice,
        status: vehicles.status,
        totalDebit: sql<number>`coalesce(sum(${daybookEntries.debitAmount}), 0)`,
        totalCredit: sql<number>`coalesce(sum(${daybookEntries.creditAmount}), 0)`,
        entries: count(daybookEntries.id),
      })
      .from(vehicles)
      .leftJoin(daybookEntries, eq(daybookEntries.vehicleId, vehicles.id))
      .groupBy(
        vehicles.id,
        vehicles.vehicleName,
        vehicles.brand,
        vehicles.variant,
        vehicles.askingPrice,
        vehicles.soldPrice,
        vehicles.status
      )
      .orderBy(asc(vehicles.vehicleName));

    return rows.map((row) => this.mapVehicleFinancialSummary(row));
  },

  async vehicleFinancialSummary(vehicleId: number): Promise<VehicleFinancialSummary | null> {
    const [row] = await db
      .select({
        vehicleId: vehicles.id,
        vehicleName: vehicles.vehicleName,
        brand: vehicles.brand,
        variant: vehicles.variant,
        askingPrice: vehicles.askingPrice,
        soldPrice: vehicles.soldPrice,
        status: vehicles.status,
        totalDebit: sql<number>`coalesce(sum(${daybookEntries.debitAmount}), 0)`,
        totalCredit: sql<number>`coalesce(sum(${daybookEntries.creditAmount}), 0)`,
        entries: count(daybookEntries.id),
      })
      .from(vehicles)
      .leftJoin(daybookEntries, eq(daybookEntries.vehicleId, vehicles.id))
      .where(eq(vehicles.id, vehicleId))
      .groupBy(
        vehicles.id,
        vehicles.vehicleName,
        vehicles.brand,
        vehicles.variant,
        vehicles.askingPrice,
        vehicles.soldPrice,
        vehicles.status
      )
      .limit(1);

    return row ? this.mapVehicleFinancialSummary(row) : null;
  },

  async vehicleLedgerEntries(vehicleId: number) {
    return db
      .select(entrySelect)
      .from(daybookEntries)
      .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
      .where(eq(daybookEntries.vehicleId, vehicleId))
      .orderBy(desc(daybookEntries.entryDate), desc(daybookEntries.createdAt))
      .limit(100);
  },

  async monthlyReport(query: MonthlyReportQuery) {
    const year = query.year ?? new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const rows = await db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${daybookEntries.entryDate}), 'YYYY-MM')`,
        totalDebit: sql<number>`coalesce(sum(${daybookEntries.debitAmount}), 0)`,
        totalCredit: sql<number>`coalesce(sum(${daybookEntries.creditAmount}), 0)`,
        transactions: count(),
      })
      .from(daybookEntries)
      .where(and(gte(daybookEntries.entryDate, start), lte(daybookEntries.entryDate, end)))
      .groupBy(sql`date_trunc('month', ${daybookEntries.entryDate})`)
      .orderBy(sql`date_trunc('month', ${daybookEntries.entryDate})`);

    return rows.map((row) => {
      const totalDebit = money(row.totalDebit);
      const totalCredit = money(row.totalCredit);
      return {
        month: row.month,
        totalDebit,
        totalCredit,
        monthlyProfit: totalCredit - totalDebit,
        transactions: Number(row.transactions ?? 0),
      };
    });
  },

  async dailyLedger(query: ReportQuery) {
    const rows = await db
      .select({
        date: sql<string>`to_char(${daybookEntries.entryDate}, 'YYYY-MM-DD')`,
        totalDebit: sql<number>`coalesce(sum(${daybookEntries.debitAmount}), 0)`,
        totalCredit: sql<number>`coalesce(sum(${daybookEntries.creditAmount}), 0)`,
        transactions: count(),
      })
      .from(daybookEntries)
      .leftJoin(vehicles, eq(daybookEntries.vehicleId, vehicles.id))
      .where(listFilters(query))
      .groupBy(sql`date(${daybookEntries.entryDate})`, sql`to_char(${daybookEntries.entryDate}, 'YYYY-MM-DD')`)
      .orderBy(desc(sql`date(${daybookEntries.entryDate})`));

    return rows.map((row) => {
      const totalDebit = money(row.totalDebit);
      const totalCredit = money(row.totalCredit);
      return {
        date: row.date,
        totalDebit,
        totalCredit,
        cashFlow: totalCredit - totalDebit,
        transactions: Number(row.transactions ?? 0),
      };
    });
  },

  async vehicleLedger(vehicleId: number) {
    const [summary, entries] = await Promise.all([
      this.vehicleFinancialSummary(vehicleId),
      this.vehicleLedgerEntries(vehicleId),
    ]);

    return {
      vehicle: summary
        ? {
            id: summary.vehicleId,
            vehicleName: summary.vehicleName,
            brand: summary.brand,
            variant: summary.variant,
            askingPrice: summary.askingPrice,
            soldPrice: summary.soldPrice,
            status: summary.status,
          }
        : null,
      entries,
      summary: {
        totalDebit: summary?.totalDebit ?? 0,
        totalCredit: summary?.totalCredit ?? 0,
        totalExpense: summary?.totalDebit ?? 0,
        totalIncome: summary?.totalCredit ?? 0,
        netProfit: summary?.netProfit ?? 0,
        pendingAmount: summary?.pendingAmount ?? 0,
      },
    };
  },
};
