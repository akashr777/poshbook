import type { Context } from 'hono';
import { auditFromContext } from '../audit';
import { fail, ok } from '../../utils/responses';
import { daybookService } from './daybook.service';
import type { AppVariables } from '../../types/app';
import type {
  CreateDaybookEntryInput,
  ListDaybookQuery,
  MonthlyReportQuery,
  ReportQuery,
  UpdateDaybookEntryInput,
} from './daybook.types';

type DaybookContext = Context<{ Variables: AppVariables }>;

function handleKnownError(c: DaybookContext, err: unknown) {
  const code = (err as { code?: string }).code;

  if (code === 'VEHICLE_NOT_FOUND') {
    return fail(c, { message: 'Vehicle not found', code }, 404);
  }

  if (code === 'INVALID_DAYBOOK_AMOUNTS') {
    return fail(c, { message: 'Invalid debit or credit amount for entry type', code }, 400);
  }

  throw err;
}

export const daybookController = {
  async list(c: DaybookContext) {
    const query = c.req.validated as ListDaybookQuery;
    const result = await daybookService.listEntries(query);
    const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));

    return ok(c, {
      items: result.items,
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages,
    });
  },

  async getById(c: DaybookContext) {
    const { id } = c.req.validatedParams as { id: number };
    const entry = await daybookService.getEntry(id);

    if (!entry) {
      return fail(c, { message: 'Daybook entry not found', code: 'DAYBOOK_ENTRY_NOT_FOUND' }, 404);
    }

    return ok(c, { entry });
  },

  async create(c: DaybookContext) {
    const input = c.req.validated as CreateDaybookEntryInput;
    const authUser = c.get('user');

    try {
      const entry = await daybookService.createEntry(input, Number(authUser.id));

      await auditFromContext(c, {
        action: 'daybook.created',
        actorUserId: Number(authUser.id),
        metadata: {
          entryId: entry.id,
          vehicleId: entry.vehicleId,
          entryType: entry.entryType,
          debitAmount: entry.debitAmount,
          creditAmount: entry.creditAmount,
        },
      });

      return ok(c, { entry }, 201);
    } catch (err) {
      return handleKnownError(c, err);
    }
  },

  async update(c: DaybookContext) {
    const { id } = c.req.validatedParams as { id: number };
    const input = c.req.validated as UpdateDaybookEntryInput;
    const authUser = c.get('user');

    try {
      const entry = await daybookService.updateEntry(id, input);
      if (!entry) {
        return fail(c, { message: 'Daybook entry not found', code: 'DAYBOOK_ENTRY_NOT_FOUND' }, 404);
      }

      await auditFromContext(c, {
        action: 'daybook.updated',
        actorUserId: Number(authUser.id),
        metadata: {
          entryId: entry.id,
          vehicleId: entry.vehicleId,
          fields: Object.keys(input),
        },
      });

      return ok(c, { entry });
    } catch (err) {
      return handleKnownError(c, err);
    }
  },

  async remove(c: DaybookContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');

    const deleted = await daybookService.deleteEntry(id);
    if (!deleted) {
      return fail(c, { message: 'Daybook entry not found', code: 'DAYBOOK_ENTRY_NOT_FOUND' }, 404);
    }

    await auditFromContext(c, {
      action: 'daybook.deleted',
      actorUserId: Number(authUser.id),
      metadata: { entryId: id },
    });

    return ok(c, { deleted: true });
  },

  async dashboard(c: DaybookContext) {
    return ok(c, await daybookService.getDashboardSummary());
  },

  async vehicleSummaries(c: DaybookContext) {
    return ok(c, { items: await daybookService.getVehicleSummaries() });
  },

  async vehicleLedger(c: DaybookContext) {
    const { vehicleId } = c.req.validatedParams as { vehicleId: number };
    const ledger = await daybookService.getVehicleLedger(vehicleId);

    if (!ledger.vehicle) {
      return fail(c, { message: 'Vehicle not found', code: 'VEHICLE_NOT_FOUND' }, 404);
    }

    return ok(c, ledger);
  },

  async dailyLedger(c: DaybookContext) {
    const query = c.req.validated as ReportQuery;
    return ok(c, { items: await daybookService.getDailyLedger(query) });
  },

  async monthlyReport(c: DaybookContext) {
    const query = c.req.validated as MonthlyReportQuery;
    return ok(c, { items: await daybookService.getMonthlyReport(query) });
  },

  async profitReport(c: DaybookContext) {
    const query = c.req.validated as ReportQuery;
    return ok(c, await daybookService.getProfitReport(query));
  },
};
