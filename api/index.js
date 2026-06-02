import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
      return c.json({
        success: true,
        message: 'Login successful',
        user: { email, name: 'Admin User' }
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

export default app;