import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SignJWT } from 'jose';

// Initialize Hono app
const app = new Hono();

// CORS middleware
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Constants
const JWT_SECRET = 'your-secret-key-change-in-production-this-should-be-at-least-32-chars-long';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const DEMO_USER = {
  id: '1',
  email: 'demo@example.com',
  username: 'demo',
  hashed_password: '$argon2id$v=19$m=65540,t=3,p=4$...',
};

// ─── Auth Endpoints ───────────────────────────────────────

app.post('/api/auth/login', async (c) => {
  const body = await c.req.parseFormData();
  const username = body.get('username');
  const password = body.get('password');

  if (username === DEMO_USER.email && password === 'demo1234') {
    // 7 days in seconds
    const expirationTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    const token = await new SignJWT({ sub: DEMO_USER.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expirationTime)
      .sign(SECRET_KEY);
    return c.json({ access_token: token, token_type: 'bearer' });
  }

  return c.json({ detail: 'Incorrect credentials' }, 401);
});

app.post('/api/auth/register', async (c) => {
  const { email, username, password } = await c.req.json();
  return c.json({
    id: '999',
    email,
    username,
  }, 201);
});

app.get('/api/auth/me', (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) {
    return c.json({ detail: 'Not authenticated' }, 401);
  }
  return c.json({
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    username: DEMO_USER.username,
  });
});

// ─── Dashboard ────────────────────────────────────────────

app.get('/api/dashboard/summary', (c) => {
  return c.json({
    total_products: 245,
    total_sales: 125000,
    total_returns: 12,
    total_engagements: 5420,
    avg_product_rating: 4.2,
    positive_sentiment_pct: 78,
    negative_sentiment_pct: 12,
    neutral_sentiment_pct: 10,
  });
});

// ─── Products ─────────────────────────────────────────────

app.get('/api/products/', (c) => {
  return c.json({
    data: [
      { id: 1, name: 'Wireless Headphones', sku: 'WH-001', price: 49.99, marketplace: 'shopee' },
      { id: 2, name: 'USB-C Cable', sku: 'USB-001', price: 12.99, marketplace: 'taobao' },
      { id: 3, name: 'Phone Stand', sku: 'PS-001', price: 19.99, marketplace: 'temu' },
      { id: 4, name: 'Screen Protector', sku: 'SP-001', price: 8.99, marketplace: 'shopee' },
      { id: 5, name: 'Portable Charger', sku: 'PC-001', price: 34.99, marketplace: 'taobao' },
    ],
    total: 5,
  });
});

// ─── Sales Analytics ──────────────────────────────────────

app.get('/api/sales/analytics/trends', (c) => {
  const days = c.req.query('days') || '30';
  const data = [];
  for (let i = 0; i < parseInt(days as string); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.unshift({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    });
  }
  return c.json({ data });
});

app.get('/api/sales/analytics/top-products', (c) => {
  const limit = c.req.query('limit') || '5';
  return c.json({
    data: [
      { id: 1, name: 'Wireless Headphones', sales: 450, revenue: 22495 },
      { id: 2, name: 'USB-C Cable', sales: 890, revenue: 11551 },
      { id: 3, name: 'Phone Stand', sales: 234, revenue: 4677 },
      { id: 4, name: 'Screen Protector', sales: 612, revenue: 5505 },
      { id: 5, name: 'Portable Charger', sales: 178, revenue: 6239 },
    ].slice(0, parseInt(limit as string)),
  });
});

app.get('/api/sales/analytics/most-returned', (c) => {
  return c.json({
    data: [
      { id: 2, name: 'USB-C Cable', returns: 45, return_rate: 0.05 },
      { id: 4, name: 'Screen Protector', returns: 23, return_rate: 0.04 },
      { id: 1, name: 'Wireless Headphones', returns: 12, return_rate: 0.03 },
    ],
  });
});

app.get('/api/sales/analytics/bundled-items', (c) => {
  return c.json({
    data: [
      { combo: 'Headphones + Cable', frequency: 234 },
      { combo: 'Phone Stand + Protector', frequency: 156 },
      { combo: 'Charger + Cable', frequency: 189 },
    ],
  });
});

app.get('/api/sales/analytics/competitor-pricing', (c) => {
  return c.json({
    data: [
      { competitor: 'Competitor A', price: 45.99, your_price: 49.99, difference: 4.0 },
      { competitor: 'Competitor B', price: 52.99, your_price: 49.99, difference: -3.0 },
    ],
  });
});

// ─── Engagement Analytics ────────────────────────────────

app.get('/api/engagement/analytics/trends', (c) => {
  const days = c.req.query('days') || '30';
  const data = [];
  for (let i = 0; i < parseInt(days as string); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.unshift({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      engagement_rate: (Math.random() * 10 + 2).toFixed(2),
    });
  }
  return c.json({ data });
});

app.get('/api/engagement/analytics/top-viewed', (c) => {
  return c.json({
    data: [
      { id: 1, name: 'Wireless Headphones', views: 12450 },
      { id: 2, name: 'USB-C Cable', views: 9870 },
      { id: 3, name: 'Phone Stand', views: 6234 },
      { id: 4, name: 'Screen Protector', views: 5120 },
      { id: 5, name: 'Portable Charger', views: 4567 },
    ],
  });
});

app.get('/api/engagement/analytics/image-views', (c) => {
  return c.json({
    data: [
      { image: 'main-hero.jpg', views: 5600 },
      { image: 'detail-1.jpg', views: 4123 },
      { image: 'detail-2.jpg', views: 3890 },
    ],
  });
});

// ─── Comments Analytics ───────────────────────────────────

app.get('/api/comments/analytics/sentiment-summary', (c) => {
  return c.json({
    data: [
      { sentiment: 'positive', count: 1234, percentage: 78 },
      { sentiment: 'neutral', count: 158, percentage: 10 },
      { sentiment: 'negative', count: 189, percentage: 12 },
    ],
  });
});

app.get('/api/comments/analytics/top-positive', (c) => {
  return c.json({
    data: [
      { id: 1, product_id: 1, text: 'Excellent quality! Highly recommended.', rating: 5 },
      { id: 2, product_id: 2, text: 'Great value for money.', rating: 5 },
      { id: 3, product_id: 1, text: 'Best purchase I made this year!', rating: 5 },
    ],
  });
});

app.get('/api/comments/analytics/top-negative', (c) => {
  return c.json({
    data: [
      { id: 100, product_id: 2, text: 'Stopped working after 2 weeks.', rating: 1 },
      { id: 101, product_id: 4, text: 'Poor quality packaging.', rating: 2 },
      { id: 102, product_id: 3, text: 'Not as described.', rating: 2 },
    ],
  });
});

app.get('/api/comments/analytics/word-frequency', (c) => {
  return c.json({
    data: [
      { word: 'excellent', frequency: 234 },
      { word: 'quality', frequency: 189 },
      { word: 'fast', frequency: 156 },
      { word: 'good', frequency: 145 },
      { word: 'delivery', frequency: 123 },
    ],
  });
});

app.get('/api/comments/analytics/themes', (c) => {
  return c.json({
    data: [
      { theme: 'Product Quality', mentions: 456 },
      { theme: 'Delivery Speed', mentions: 234 },
      { theme: 'Customer Service', mentions: 189 },
      { theme: 'Packaging', mentions: 123 },
    ],
  });
});

// ─── Insights ─────────────────────────────────────────────

app.post('/api/insights/ask', async (c) => {
  const { segments, question } = await c.req.json();
  return c.json({
    answer: 'Based on your sales data, the top-performing segment is the budget category with 45% higher engagement than premium products. Consider increasing marketing spend in this area.',
    confidence: 0.87,
  });
});

app.get('/api/insights/history', (c) => {
  return c.json({
    data: [
      { id: 1, question: 'Which products have the highest ROI?', answer: 'USB cables and phone stands...', created_at: '2024-03-01' },
      { id: 2, question: 'What is my average customer satisfaction?', answer: 'Your average rating is 4.2 stars...', created_at: '2024-02-28' },
    ],
  });
});

// ─── Health Check ─────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({ status: 'healthy', service: 'marketlens-api' });
});

app.get('/debug', (c) => {
  return c.json({ 
    status: 'debug', 
    message: 'API is running',
    routes: ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/dashboard/summary', '/api/products/']
  });
});

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'E-Commerce Analytics API is running (v2)' });
});

// Catch-all 404 handler
app.all('*', (c) => {
  return c.json({ error: 'Not Found', path: c.req.path, method: c.req.method }, 404);
});

export default app;
