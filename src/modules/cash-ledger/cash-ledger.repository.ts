import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { cashLedger } from './cash-ledger.schema.js';
import type { CashLedgerCreateInput, CashLedgerReportQuery } from './cash-ledger.types.js';

type DbClient = typeof db;

function dateFilters(query: CashLedgerReportQuery = {}) {
  const filters = [] as any[];
  if (query.fromDate) filters.push(gte(cashLedger.ledgerDate, query.fromDate));
  if (query.toDate) filters.push(lte(cashLedger.ledgerDate, query.toDate));
  return filters.length ? and(...filters) : undefined;
}

export const cashLedgerRepository = {
  async create(input: CashLedgerCreateInput, client: DbClient = db) {
    const [created] = await client.insert(cashLedger).values(input).returning();
    return created;
  },

  async recent(limit = 10) {
    return db.select().from(cashLedger).orderBy(desc(cashLedger.ledgerDate), desc(cashLedger.id)).limit(limit);
  },

  async cashPosition(query: CashLedgerReportQuery = {}) {
    const [row] = await db
      .select({
        cashIn: sql<number>`coalesce(sum(case when ${cashLedger.direction} = 'IN' then ${cashLedger.amount} else 0 end), 0)`,
        cashOut: sql<number>`coalesce(sum(case when ${cashLedger.direction} = 'OUT' then ${cashLedger.amount} else 0 end), 0)`,
      })
      .from(cashLedger)
      .where(dateFilters(query));

    const cashIn = Number(row?.cashIn ?? 0);
    const cashOut = Number(row?.cashOut ?? 0);

    return {
      cashIn,
      cashOut,
      netCashPosition: cashIn - cashOut,
    };
  },

  async cashFlow(query: CashLedgerReportQuery = {}) {
    return db
      .select({
        date: sql<string>`to_char(${cashLedger.ledgerDate}, 'YYYY-MM-DD')`,
        cashIn: sql<number>`coalesce(sum(case when ${cashLedger.direction} = 'IN' then ${cashLedger.amount} else 0 end), 0)`,
        cashOut: sql<number>`coalesce(sum(case when ${cashLedger.direction} = 'OUT' then ${cashLedger.amount} else 0 end), 0)`,
      })
      .from(cashLedger)
      .where(dateFilters(query))
      .groupBy(sql`date(${cashLedger.ledgerDate})`, sql`to_char(${cashLedger.ledgerDate}, 'YYYY-MM-DD')`)
      .orderBy(desc(sql`date(${cashLedger.ledgerDate})`));
  },
};
