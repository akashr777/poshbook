const { serve } = require('@hono/node-server');
const { app } = require('./dist/app.js');
require('dotenv/config');

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
  console.log(`🔐 Auth endpoint: /api/auth/login`);
  console.log(`🚗 API endpoints: /api/vehicles, /api/users, /api/daybook`);
});