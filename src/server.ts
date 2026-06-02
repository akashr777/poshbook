import { serve } from 'bun';
import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

env; // fail-fast env validation

const port = env.PORT;

logger.info({ port, env: env.NODE_ENV }, 'server starting');

serve({
  port,
  fetch: app.fetch
});

