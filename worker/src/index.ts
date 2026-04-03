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
  try {
    // Parse request body
    let username = '';
    let password = '';
    
    const contentType = c.req.header('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await c.req.json();
      username = body.username || '';
      password = body.password || '';
    } else {
      // Handle form data
      const body = await c.req.formData();
      username = body.get('username')?.toString() || '';
      password = body.get('password')?.toString() || '';
    }

    if (username === DEMO_USER.email && password === 'demo1234') {
      try {
        // 7 days in seconds
        const expirationTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
        const token = await new SignJWT({ sub: DEMO_USER.id })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime(expirationTime)
          .sign(SECRET_KEY);
        return c.json({ access_token: token, token_type: 'bearer' });
      } catch (jwtError) {
        console.error('JWT signing error:', jwtError);
        return c.json({ detail: 'JWT error', error: String(jwtError) }, 500);
      }
    }

    return c.json({ detail: 'Incorrect credentials' }, 401);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ detail: 'Internal server error', error: String(error) }, 500);
  }
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
    total_revenue: 125000,
    total_orders: 1245,
    total_returns: 12,
    avg_ctr: 8.5,
    total_page_visits: 54230,
    total_cart_adds: 8342,
    positive_comments: 1234,
    negative_comments: 189,
    avg_product_rating: 4.2,
    positive_sentiment_pct: 78,
    negative_sentiment_pct: 12,
    neutral_sentiment_pct: 10,
  });
});

app.get('/api/dashboard/comments', (c) => {
  return c.json([
    { id: 1, product_id: 1, product_name: 'Wireless Headphones', sentiment: 'positive', text: 'Excellent sound quality!', rating: 5, created_at: '2026-03-30' },
    { id: 2, product_id: 2, product_name: 'USB-C Cable', sentiment: 'positive', text: 'Great value for money.', rating: 5, created_at: '2026-03-29' },
    { id: 3, product_id: 3, product_name: 'Phone Stand', sentiment: 'neutral', text: 'Does what it should.', rating: 3, created_at: '2026-03-28' },
    { id: 4, product_id: 1, product_name: 'Wireless Headphones', sentiment: 'negative', text: 'Battery died after 6 months.', rating: 2, created_at: '2026-03-27' },
    { id: 5, product_id: 4, product_name: 'Screen Protector', sentiment: 'positive', text: 'Perfect fit, excellent protection.', rating: 5, created_at: '2026-03-26' },
  ]);
});

// ─── Products ─────────────────────────────────────────────

app.get('/api/products/', (c) => {
  return c.json([
    { id: 1, name: 'Wireless Headphones', sku: 'WH-001', price: 49.99, marketplace: 'shopee' },
    { id: 2, name: 'USB-C Cable', sku: 'USB-001', price: 12.99, marketplace: 'taobao' },
    { id: 3, name: 'Phone Stand', sku: 'PS-001', price: 19.99, marketplace: 'temu' },
    { id: 4, name: 'Screen Protector', sku: 'SP-001', price: 8.99, marketplace: 'shopee' },
    { id: 5, name: 'Portable Charger', sku: 'PC-001', price: 34.99, marketplace: 'taobao' },
  ]);
});

// ─── Sales Analytics ──────────────────────────────────────

app.get('/api/sales/analytics/trends', (c) => {
  const days = c.req.query('days') || '30';
  const salesData = [
    { date: '2026-03-05', sales: 1450, orders: 42, revenue: 18500 },
    { date: '2026-03-06', sales: 2100, orders: 58, revenue: 26200 },
    { date: '2026-03-07', sales: 1890, orders: 51, revenue: 23400 },
    { date: '2026-03-08', sales: 2450, orders: 67, revenue: 31200 },
    { date: '2026-03-09', sales: 3200, orders: 88, revenue: 40100 },
    { date: '2026-03-10', sales: 2850, orders: 76, revenue: 35600 },
    { date: '2026-03-11', sales: 1950, orders: 54, revenue: 24200 },
    { date: '2026-03-12', sales: 2650, orders: 73, revenue: 33100 },
    { date: '2026-03-13', sales: 3450, orders: 95, revenue: 42800 },
    { date: '2026-03-14', sales: 2200, orders: 60, revenue: 27500 },
    { date: '2026-03-15', sales: 2800, orders: 77, revenue: 34900 },
    { date: '2026-03-16', sales: 1650, orders: 46, revenue: 20600 },
    { date: '2026-03-17', sales: 3100, orders: 85, revenue: 38700 },
    { date: '2026-03-18', sales: 2400, orders: 65, revenue: 29800 },
    { date: '2026-03-19', sales: 2750, orders: 74, revenue: 34200 },
    { date: '2026-03-20', sales: 1850, orders: 50, revenue: 23000 },
    { date: '2026-03-21', sales: 2245, orders: 61, revenue: 27900 },
    { date: '2026-03-22', sales: 3100, orders: 85, revenue: 38600 },
    { date: '2026-03-23', sales: 1920, orders: 53, revenue: 23800 },
    { date: '2026-03-24', sales: 2650, orders: 72, revenue: 32900 },
    { date: '2026-03-25', sales: 3400, orders: 93, revenue: 42200 },
    { date: '2026-03-26', sales: 2100, orders: 57, revenue: 26100 },
    { date: '2026-03-27', sales: 2900, orders: 79, revenue: 36000 },
    { date: '2026-03-28', sales: 3600, orders: 99, revenue: 44700 },
    { date: '2026-03-29', sales: 2550, orders: 70, revenue: 31600 },
    { date: '2026-03-30', sales: 2200, orders: 61, revenue: 27300 },
    { date: '2026-03-31', sales: 3050, orders: 84, revenue: 37800 },
    { date: '2026-04-01', sales: 2750, orders: 75, revenue: 34000 },
    { date: '2026-04-02', sales: 3300, orders: 91, revenue: 40900 },
    { date: '2026-04-03', sales: 2800, orders: 77, revenue: 34600 },
  ];
  return c.json(salesData.slice(-parseInt(days as string)));
});

app.get('/api/sales/analytics/top-products', (c) => {
  const limit = c.req.query('limit') || '5';
  return c.json([
    { id: 1, name: 'Wireless Headphones', sales: 450, revenue: 22495 },
    { id: 2, name: 'USB-C Cable', sales: 890, revenue: 11551 },
    { id: 3, name: 'Phone Stand', sales: 234, revenue: 4677 },
    { id: 4, name: 'Screen Protector', sales: 612, revenue: 5505 },
    { id: 5, name: 'Portable Charger', sales: 178, revenue: 6239 },
  ].slice(0, parseInt(limit as string)));
});

app.get('/api/sales/analytics/most-returned', (c) => {
  return c.json([
    { id: 2, name: 'USB-C Cable', returns: 45, return_rate: 0.05 },
    { id: 4, name: 'Screen Protector', returns: 23, return_rate: 0.04 },
    { id: 1, name: 'Wireless Headphones', returns: 12, return_rate: 0.03 },
  ]);
});

app.get('/api/sales/analytics/bundled-items', (c) => {
  return c.json([
    { combo: 'Headphones + Cable', frequency: 234 },
    { combo: 'Phone Stand + Protector', frequency: 156 },
    { combo: 'Charger + Cable', frequency: 189 },
  ]);
});

app.get('/api/sales/analytics/competitor-pricing', (c) => {
  return c.json([
    { competitor: 'Competitor A', price: 45.99, your_price: 49.99, difference: 4.0 },
    { competitor: 'Competitor B', price: 52.99, your_price: 49.99, difference: -3.0 },
  ]);
});

// ─── Engagement Analytics ────────────────────────────────

app.get('/api/engagement/analytics/trends', (c) => {
  const days = c.req.query('days') || '30';
  const engagementData = [
    { date: '2026-03-21', views: 2245, clicks: 483, engagement_rate: '11.50' },
    { date: '2026-03-22', views: 4719, clicks: 342, engagement_rate: '8.38' },
    { date: '2026-03-23', views: 2141, clicks: 126, engagement_rate: '4.50' },
    { date: '2026-03-24', views: 3330, clicks: 104, engagement_rate: '2.69' },
    { date: '2026-03-25', views: 1745, clicks: 226, engagement_rate: '7.55' },
    { date: '2026-03-26', views: 3599, clicks: 51, engagement_rate: '5.54' },
    { date: '2026-03-27', views: 3508, clicks: 333, engagement_rate: '10.83' },
    { date: '2026-03-28', views: 7555, clicks: 368, engagement_rate: '11.22' },
    { date: '2026-03-29', views: 6540, clicks: 411, engagement_rate: '6.74' },
    { date: '2026-03-30', views: 3372, clicks: 184, engagement_rate: '2.71' },
    { date: '2026-03-31', views: 8342, clicks: 245, engagement_rate: '9.99' },
    { date: '2026-04-01', views: 5403, clicks: 464, engagement_rate: '5.27' },
    { date: '2026-04-02', views: 10138, clicks: 127, engagement_rate: '4.19' },
    { date: '2026-04-03', views: 9328, clicks: 497, engagement_rate: '3.06' },
  ];
  return c.json(engagementData.slice(-parseInt(days as string)));
});

app.get('/api/engagement/analytics/top-viewed', (c) => {
  return c.json([
    { id: 1, name: 'Wireless Headphones', views: 12450 },
    { id: 2, name: 'USB-C Cable', views: 9870 },
    { id: 3, name: 'Phone Stand', views: 7234 },
    { id: 4, name: 'Screen Protector', views: 5890 },
    { id: 5, name: 'Portable Charger', views: 4567 },
  ]);
});

app.get('/api/engagement/analytics/image-views', (c) => {
  return c.json([
    { product_id: 1, image_url: 'headphones-1.jpg', views: 8934 },
    { product_id: 1, image_url: 'headphones-2.jpg', views: 7654 },
    { product_id: 2, image_url: 'cable-1.jpg', views: 6234 },
    { product_id: 3, image_url: 'stand-1.jpg', views: 5123 },
    { product_id: 4, image_url: 'protector-1.jpg', views: 4567 },
  ]);
});

// ─── Comments Analytics ───────────────────────────────────

app.get('/api/comments/analytics/sentiment-summary', (c) => {
  return c.json([
    { sentiment: 'positive', count: 1234, avg_rating: 4.8 },
    { sentiment: 'neutral', count: 158, avg_rating: 3.5 },
    { sentiment: 'negative', count: 189, avg_rating: 1.9 },
  ]);
});

app.get('/api/comments/analytics/top-positive', (c) => {
  return c.json([
    { id: 1, product_id: 1, author: 'Sarah M.', text: 'Excellent quality! Highly recommended.', rating: 5 },
    { id: 2, product_id: 2, author: 'John D.', text: 'Great value for money.', rating: 5 },
    { id: 3, product_id: 1, author: 'Emma L.', text: 'Best purchase I made this year!', rating: 5 },
  ]);
});

app.get('/api/comments/analytics/top-negative', (c) => {
  return c.json([
    { id: 100, product_id: 2, author: 'Mike T.', text: 'Stopped working after 2 weeks.', rating: 1 },
    { id: 101, product_id: 4, author: 'Lisa P.', text: 'Poor quality packaging.', rating: 2 },
    { id: 102, product_id: 3, author: 'Tom R.', text: 'Not as described.', rating: 2 },
  ]);
});

app.get('/api/comments/analytics/word-frequency', (c) => {
  return c.json([
    { word: 'excellent', count: 234 },
    { word: 'quality', count: 189 },
    { word: 'fast', count: 156 },
    { word: 'good', count: 145 },
    { word: 'delivery', count: 123 },
  ]);
});

app.get('/api/comments/analytics/themes', (c) => {
  return c.json({
    praise_themes: [
      { theme: 'Product Quality', count: 456 },
      { theme: 'Delivery Speed', count: 234 },
      { theme: 'Customer Service', count: 189 },
    ],
    complaint_themes: [
      { theme: 'Packaging', count: 123 },
      { theme: 'Battery Life', count: 98 },
      { theme: 'Durability', count: 67 },
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
  return c.json([
    { id: 1, question: 'Which products have the highest ROI?', answer: 'USB cables and phone stands...', created_at: '2024-03-01' },
    { id: 2, question: 'What is my average customer satisfaction?', answer: 'Your average rating is 4.2 stars...', created_at: '2024-02-28' },
  ]);
});

// ─── Health Check ─────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({ status: 'healthy', service: 'marketlens-api' });
});

app.get('/debug', (c) => {
  return c.json({ 
    status: 'debug', 
    message: 'API is running',
    routes: ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/dashboard/summary', '/api/dashboard/comments', '/api/products/']
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
