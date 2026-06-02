import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { authRouter } from './routes/auth.js';
import { usersRouter } from './modules/users/index.js';
import { healthRouter } from './routes/health.js';
import { vehiclesRouter } from './modules/vehicles/index.js';
import { daybookRouter } from './modules/daybook/index.js';
import { vendorsRouter } from './modules/vendors/index.js';
import { fundersRouter } from './modules/funders/index.js';
import { vendorLedgerRouter } from './modules/vendor-ledger/index.js';
import { expensesRouter } from './modules/expenses/index.js';
import { salariesRouter } from './modules/salaries/index.js';
import { vehicleAccountingRouter } from './modules/vehicle-accounting/index.js';
import { vehicleExchangeRouter } from './modules/vehicle-exchange/index.js';
import { paymentsRouter } from './modules/payments/index.js';
import { dashboardRouter } from './modules/dashboard/index.js';
import { reportsRouter } from './modules/reports/index.js';
import type { AppVariables } from './types/app.js';
export const app = new Hono<{ Variables: AppVariables }>();

/* ================= TRUST / SECURITY HEADERS ================= */
app.use('*', secureHeaders());

/* ================= CORS ================= */
// Parse CORS origins - supports comma-separated string or single origin
const parseCorsOrigin = (origin: string): string | string[] => {
  if (origin === '*') return '*';
  if (origin.includes(',')) {
    return origin.split(',').map(o => o.trim()).filter(Boolean);
  }
  return origin;
};

app.use(
  '*',
  cors({
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    credentials: env.CORS_ALLOW_CREDENTIALS,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposeHeaders: ['Set-Cookie'],
    maxAge: 86400,
  })
);

// Explicit OPTIONS handler for preflight requests - FIXED
app.options('*', (c) => {
  c.status(204);
  return c.text('');
});

/* ================= REQUEST LOGGER ================= */
app.use('*', async (c, next) => {
  const start = Date.now();

  // simple request id (useful in production debugging)
  const requestId = crypto.randomUUID();
  c.res.headers.set('x-request-id', requestId);

  try {
    await next();
  } finally {
    const ms = Date.now() - start;

    logger.info({
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: ms
    });
  }
});

/* ================= HEALTH CHECK ================= */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    env: env.NODE_ENV
  });
});

/* ================= ROUTES ================= */
app.route('/api/auth', authRouter);
app.route('/api/users', usersRouter);
app.route('/api/vehicles/exchange', vehicleExchangeRouter);
app.route('/api/vehicles', vehiclesRouter);
app.route('/api/vehicles', vehicleAccountingRouter);
app.route('/api/daybook', daybookRouter);
app.route('/api/vendors', vendorsRouter);
app.route('/api/vendors', vendorLedgerRouter);
app.route('/api/funders', fundersRouter);
app.route('/api/expenses', expensesRouter);
app.route('/api/salaries', salariesRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/reports', reportsRouter);
app.route('/api', healthRouter);

/* ================= ROOT (DEV SAFETY ONLY) ================= */
if (env.NODE_ENV !== 'production') {
  app.get('/', (c) => c.text('API WORKING'));
}

/* ================= GLOBAL 404 ================= */
app.notFound((c) => {
  return c.json(
    {
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND'
      }
    },
    404
  );
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.onError((err, c) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: c.req.path
  });

  return errorHandler(err, c);
});