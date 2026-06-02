import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { funderTransactions, funders } from '../schemas/funder.schema.js';
import type {
  CreateFunderDto,
  CreateFunderTransactionDto,
  LedgerQueryDto,
  ListFundersQueryDto,
  UpdateFunderDto,
} from '../dto/funder.dto.js';

type DbClient = typeof db;

function ledgerFilters(funderId: number, query: LedgerQueryDto = {}) {
  const filters = [eq(funderTransactions.funderId, funderId)] as any[];
  if (query.fromDate) filters.push(gte(funderTransactions.transactionDate, query.fromDate));
  if (query.toDate) filters.push(lte(funderTransactions.transactionDate, query.toDate));
  return and(...filters);
}

export const funderRepository = {
  async findById(id: number, client: DbClient = db) {
    const [row] = await client.select().from(funders).where(eq(funders.id, id)).limit(1);
    return row ?? null;
  },

  async findByCode(funderCode: string) {
    const [row] = await db.select().from(funders).where(eq(funders.funderCode, funderCode)).limit(1);
    return row ?? null;
  },

  async list(query: ListFundersQueryDto) {
    const filters = [] as any[];
    if (query.status) filters.push(eq(funders.status, query.status));
    if (query.search) {
      filters.push(
        or(
          ilike(funders.funderName, `%${query.search}%`),
          ilike(funders.funderCode, `%${query.search}%`),
          ilike(funders.phone, `%${query.search}%`),
          ilike(funders.email, `%${query.search}%`)
        )
      );
    }
    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.pageSize;
    const sortColumn =
      query.sortBy === 'funderName'
        ? funders.funderName
        : query.sortBy === 'funderCode'
          ? funders.funderCode
          : funders.createdAt;

    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(funders)
        .where(where)
        .orderBy(query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
        .limit(query.pageSize)
        .offset(offset),
      db.select({ total: count() }).from(funders).where(where),
    ]);

    return { items, total: Number(totalRow[0]?.total ?? 0) };
  },

  async create(input: CreateFunderDto) {
    const [created] = await db.insert(funders).values(input).returning();
    return created;
  },

  async update(id: number, input: UpdateFunderDto) {
    const [updated] = await db.update(funders).set({ ...input, updatedAt: new Date() }).where(eq(funders.id, id)).returning();
    return updated ?? null;
  },

  async delete(id: number) {
    const deleted = await db.delete(funders).where(eq(funders.id, id)).returning({ id: funders.id });
    return deleted.length > 0;
  },

  async createTransaction(funderId: number, input: CreateFunderTransactionDto, createdBy: number, client: DbClient = db) {
    const [created] = await client
      .insert(funderTransactions)
      .values({
        funderId,
        transactionType: input.transactionType,
        amount: input.amount,
        transactionDate: input.transactionDate,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        notes: input.notes ?? null,
        createdBy,
      })
      .returning();
    return created;
  },

  async ledger(id: number, query: LedgerQueryDto = {}) {
    const [summary, transactions] = await Promise.all([
      db
        .select({
          totalFunded: sql<number>`coalesce(sum(case when ${funderTransactions.transactionType} = 'FUND_IN' then ${funderTransactions.amount} else 0 end), 0)`,
          totalRepaid: sql<number>`coalesce(sum(case when ${funderTransactions.transactionType} = 'REPAYMENT' then ${funderTransactions.amount} else 0 end), 0)`,
        })
        .from(funderTransactions)
        .where(ledgerFilters(id, query)),
      db
        .select()
        .from(funderTransactions)
        .where(ledgerFilters(id, query))
        .orderBy(asc(funderTransactions.transactionDate), asc(funderTransactions.id)),
    ]);

    const totalFunded = Number(summary[0]?.totalFunded ?? 0);
    const totalRepaid = Number(summary[0]?.totalRepaid ?? 0);
    return {
      transactions,
      summary: {
        totalFunded,
        totalRepaid,
        outstanding: totalFunded - totalRepaid,
      },
    };
  },

  async aggregate() {
    const [row] = await db
      .select({
        totalFunded: sql<number>`coalesce(sum(case when ${funderTransactions.transactionType} = 'FUND_IN' then ${funderTransactions.amount} else 0 end), 0)`,
        totalRepaid: sql<number>`coalesce(sum(case when ${funderTransactions.transactionType} = 'REPAYMENT' then ${funderTransactions.amount} else 0 end), 0)`,
      })
      .from(funderTransactions);

    const totalFunded = Number(row?.totalFunded ?? 0);
    const totalRepaid = Number(row?.totalRepaid ?? 0);
    return { totalFunded, totalRepaid, outstanding: totalFunded - totalRepaid };
  },
};
