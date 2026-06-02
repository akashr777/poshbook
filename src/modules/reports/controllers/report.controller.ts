import type { Context } from 'hono';
import { ok } from '../../../utils/responses.js';
import type { AppVariables } from '../../../types/app.js';
import { reportService } from '../services/report.service.js';
import type { ReportQueryDto } from '../dto/report.dto.js';

type ReportContext = Context<{ Variables: AppVariables }>;

export const reportController = {
  async funders(c: ReportContext) {
    return ok(c, await reportService.funders());
  },
  async vendors(c: ReportContext) {
    return ok(c, await reportService.vendors());
  },
  async expenses(c: ReportContext) {
    return ok(c, { items: await reportService.expenses(c.req.validated as ReportQueryDto) });
  },
  async salaries(c: ReportContext) {
    return ok(c, { items: await reportService.salaries(c.req.validated as ReportQueryDto) });
  },
  async vehicles(c: ReportContext) {
    return ok(c, await reportService.vehicles());
  },
  async exchanges(c: ReportContext) {
    return ok(c, { items: await reportService.exchanges(c.req.validated as ReportQueryDto) });
  },
  async profitLoss(c: ReportContext) {
    return ok(c, await reportService.profitLoss(c.req.validated as ReportQueryDto));
  },
  async cashFlow(c: ReportContext) {
    return ok(c, { items: await reportService.cashFlow(c.req.validated as ReportQueryDto) });
  },
};
