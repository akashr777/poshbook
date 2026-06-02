import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('/*', cors({
  origin: ['https://poshbook-2b62c.web.app', 'http://localhost:5173'],
  credentials: true,
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test', (c) => {
  return c.json({ message: 'API is working!' });
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (email === 'admin@gmail.com' && password === 'Admin123!') {
      // Create a token
      const token = Buffer.from(JSON.stringify({ 
        email, 
        userId: 1, 
        exp: Date.now() + 86400000 
      })).toString('base64');
      
      return c.json({
        success: true,
        message: 'Login successful',
        user: { 
          id: 1,
          email: email, 
          name: 'Admin User',
          role: 'admin'
        },
        token: token,
        data: {
          accessToken: token
        }
      });
    }
    
    return c.json({
      success: false,
      message: 'Invalid credentials'
    }, 401);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Server error'
    }, 500);
  }
});

app.notFound((c) => c.json({ error: 'Route not found' }, 404));

app.onError((err, c) => {
  console.error(err.message);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server is running on port ${info.port}`);
});