import type { Context } from 'hono';
import { ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { dashboardService } from '../services/dashboard.service';

type DashboardContext = Context<{ Variables: AppVariables }>;

export const dashboardController = {
  async summary(c: DashboardContext) {
    return ok(c, await dashboardService.summary());
  },
};
