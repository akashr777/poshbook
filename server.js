import { serve } from '@hono/node-server';
import { app } from './src/app.js';  // Your real Hono app with all routes
import { env } from './src/config/env.js';

const port = env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}`);
console.log(`📊 Environment: ${env.NODE_ENV}`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
  console.log(`🔐 Auth endpoint: http://localhost:${info.port}/api/auth/login`);
  console.log(`🚗 Vehicles: http://localhost:${info.port}/api/vehicles`);
});