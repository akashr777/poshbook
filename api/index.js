import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('/*', cors({
  origin: ['https://poshbook-2b62c.web.app', 'http://localhost:5173'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({ message: 'API is working!' });
});

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (email === 'admin@gmail.com' && password === 'Admin123!') {
      const token = Buffer.from(JSON.stringify({ 
        email, 
        userId: 1, 
        role: 'admin',
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

// ============ ADMIN DASHBOARD ENDPOINTS ============

// Get all users
app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
      { id: 2, name: 'John Driver', email: 'john@example.com', role: 'driver', status: 'active', createdAt: new Date().toISOString() },
      { id: 3, name: 'Sarah Staff', email: 'sarah@example.com', role: 'staff', status: 'active', createdAt: new Date().toISOString() }
    ]
  });
});

// Create user
app.post('/api/users', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({
      success: true,
      message: 'User created successfully',
      user: { id: Date.now(), ...body, createdAt: new Date().toISOString() }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to create user' }, 500);
  }
});

// Update user
app.put('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    return c.json({
      success: true,
      message: `User ${id} updated successfully`,
      user: { id: parseInt(id), ...body }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete('/api/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ success: true, message: `User ${id} deleted successfully` });
});

// Get all vehicles
app.get('/api/vehicles', (c) => {
  return c.json({
    vehicles: [
      { id: 1, name: 'Toyota Camry', plateNumber: 'ABC-123', status: 'active', owner: 'John Driver' },
      { id: 2, name: 'Honda Accord', plateNumber: 'XYZ-789', status: 'active', owner: 'Sarah Staff' }
    ]
  });
});

// Create vehicle
app.post('/api/vehicles', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle: { id: Date.now(), ...body }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to create vehicle' }, 500);
  }
});

// Daybook dashboard
app.get('/api/daybook/dashboard', (c) => {
  return c.json({
    totalTrips: 156,
    totalRevenue: 45280,
    totalExpenses: 12450,
    netProfit: 32830,
    recentEntries: [
      { id: 1, date: new Date().toISOString(), description: 'Trip to Airport', amount: 450, type: 'income' },
      { id: 2, date: new Date().toISOString(), description: 'Fuel', amount: 75, type: 'expense' }
    ]
  });
});

// Get daybook entries
app.get('/api/daybook', (c) => {
  return c.json({
    entries: [
      { id: 1, date: new Date().toISOString(), description: 'Trip #1', amount: 450, type: 'income' },
      { id: 2, date: new Date().toISOString(), description: 'Trip #2', amount: 320, type: 'income' }
    ]
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (c) => {
  return c.json({
    totalVehicles: 24,
    totalDrivers: 18,
    totalRevenue: 125680,
    totalExpenses: 45230,
    pendingApprovals: 3,
    activeTrips: 8
  });
});

// Vendors
app.get('/api/vendors', (c) => {
  return c.json({
    vendors: [
      { id: 1, name: 'Auto Parts Co', contact: '123-456-7890', status: 'active' },
      { id: 2, name: 'Tire Kingdom', contact: '098-765-4321', status: 'active' }
    ]
  });
});

// Funders
app.get('/api/funders', (c) => {
  return c.json({
    funders: [
      { id: 1, name: 'Bank of America', amount: 50000, rate: 5.5, status: 'active' },
      { id: 2, name: 'Chase Bank', amount: 75000, rate: 4.8, status: 'active' }
    ]
  });
});

// Catch-all for any other API endpoints (returns empty data)
app.get('/api/*', (c) => {
  return c.json({ data: [], message: 'Endpoint not yet implemented' });
});

app.post('/api/*', (c) => {
  return c.json({ success: true, message: 'Request received' });
});

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// Error handler
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