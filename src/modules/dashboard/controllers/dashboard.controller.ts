import type { Context } from 'hono';
import { ok } from '../../../utils/responses.js';
import type { AppVariables } from '../../../types/app.js';
import { dashboardService } from '../services/dashboard.service.js';

type DashboardContext = Context<{ Variables: AppVariables }>;

export const dashboardController = {
  async summary(c: DashboardContext) {
    return ok(c, await dashboardService.summary());
  },
};
