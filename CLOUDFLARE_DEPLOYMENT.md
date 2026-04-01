# MarketLens Cloudflare Deployment Guide

## Overview

This guide covers deploying MarketLens on Cloudflare with:
- **Frontend**: Next.js 14 on Cloudflare Pages
- **Backend API**: FastAPI on external service (Railway, Fly.io, Vercel) OR Cloudflare Workers proxy
- **Database**: PostgreSQL (Supabase, Railway, or managed provider)

---

## Prerequisites

1. **Cloudflare Account** - [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. **Domain** - Must be using Cloudflare nameservers
3. **GitHub/GitLab** - For CI/CD integration
4. **External Backend Service** (choose one):
   - Railway.app
   - Fly.io  
   - Render.com
   - Vercel
   - AWS/GCP/Azure with FastAPI
5. **PostgreSQL Database** (choose one):
   - Supabase (recommended for Postgres)
   - Railway
   - Render
   - AWS RDS

---

## Architecture

```
┌─────────────────────┐
│   User Browser      │
└──────────┬──────────┘
           │
           ├──────────────────────────────┐
           │                              │
    ┌──────▼─────────┐          ┌────────▼─────────┐
    │ Cloudflare     │          │  Cloudflare      │
    │ Pages          │          │  Workers (Cache) │
    │ (Frontend)     │          │ (API Proxy)      │
    └────────┬───────┘          └────────┬─────────┘
             │                           │
             └───────────┬───────────────┘
                         │
                    ┌────▼──────────────┐
                    │ Backend FastAPI   │
                    │ (Railway/Fly/etc) │
                    └────┬──────────────┘
                         │
                    ┌────▼──────────────┐
                    │ PostgreSQL DB     │
                    │ (Supabase/etc)    │
                    └───────────────────┘
```

---

## Step 1: Prepare Frontend for Cloudflare Pages

### 1.1 Update `next.config.js`

```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Cloudflare Pages compatibility
  output: 'export', // Static export
  // Or use: output: 'standalone', // For server-side rendering
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 1.2 Update environment configuration

```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.marketlens.com
NEXT_PUBLIC_APP_URL=https://marketlens.com
```

---

## Step 2: Deploy Backend to External Service

### Option A: Railway.app (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Create Railway project**:
   ```bash
   cd backend
   railway init
   railway link
   ```

3. **Create Dockerfile** (`backend/Dockerfile`):
   ```dockerfile
   FROM python:3.13-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

4. **Deploy**:
   ```bash
   railway up
   railway open
   ```

### Option B: Fly.io

1. **Install Fly CLI**: [https://fly.io/docs/getting-started/installing-flyctl/](https://fly.io/docs/getting-started/installing-flyctl/)

2. **Create `fly.toml`**:
   ```toml
   app = "marketlens-api"
   primary_region = "sjc"
   
   [build]
     image = "marketlens:latest"
   
   [env]
     PYTHONUNBUFFERED = "true"
   
   [[services]]
     protocol = "tcp"
     internal_port = 8000
     processes = ["app"]
     [[services.ports]]
       number = 443
       handlers = ["tls", "http"]
     [[services.ports]]
       number = 80
       handlers = ["http"]
   ```

3. **Deploy**:
   ```bash
   cd backend
   fly deploy
   fly secrets set OPENAI_API_KEY=your_key
   fly open
   ```

---

## Step 3: Deploy Database with Supabase

1. **Create Supabase project**: [https://supabase.com](https://supabase.com)

2. **Create PostgreSQL database** - Supabase handles this automatically

3. **Get connection string**:
   ```
   PostgreSQL Connection: postgresql://user:password@host:5432/postgres
   ```

4. **Update backend `.env`**:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/marketlens
   SECRET_KEY=your-long-random-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OPENAI_API_KEY=your-openai-key
   ```

5. **Run migrations** (one-time setup):
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   python seed.py
   ```

---

## Step 4: Deploy Frontend to Cloudflare Pages

### 4.1 Connect GitHub Repository

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a Project** → **Connect to Git**
3. Authorize GitHub and select `ecomm_analyst` repo
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `frontend/.next`
   - **Root Directory**: `frontend`

### 4.2 Set Environment Variables

In Cloudflare Pages → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://api.marketlens.com
NEXT_PUBLIC_APP_NAME = MarketLens
NODE_ENV = production
```

### 4.3 Configure Custom Domain

1. Go to **Pages** → **Your Project** → **Custom Domains**
2. Add custom domain: `marketlens.com`
3. Configure DNS records as instructed

---

## Step 5: Configure API Proxy with Cloudflare Workers

> Optional: Create a Cloudflare Worker to proxy API requests for caching and rate limiting

### 5.1 Create Worker

```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route API requests to backend
    if (url.pathname.startsWith('/api/')) {
      const backendURL = new URL(url.pathname + url.search, env.BACKEND_URL);
      
      // Add CORS headers
      const response = await fetch(new Request(backendURL, request), {
        cf: {
          cacheTtl: 60, // Cache for 60 seconds
        },
      });
      
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return newResponse;
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```

### 5.2 Deploy Worker

```bash
wrangler deploy
```

### 5.3 Update wrangler.toml

```toml
[env.production.vars]
BACKEND_URL = "https://api.marketlens.com"
```

---

## Step 6: CI/CD GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: frontend
          command: pages deploy .next
```

---

## Step 7: Environment Variables Setup

### Backend (.env on Railway/Fly)

```bash
DATABASE_URL=postgresql://user:password@host/marketlens
SECRET_KEY=your-secure-random-string-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://marketlens.com,https://www.marketlens.com
```

### Frontend (.env.production in Cloudflare Pages)

```bash
NEXT_PUBLIC_API_URL=https://api.marketlens.com
NEXT_PUBLIC_APP_NAME=MarketLens
NODE_ENV=production
```

---

## Step 8: Monitoring & Maintenance

### Cloudflare Analytics

1. **Pages** → **Your Project** → **Analytics**
   - Monitor traffic, build success, and errors

### Backend Monitoring

**Railway/Fly Dashboard**:
- CPU and memory usage
- Log viewer
- Deployment history

### Database Monitoring

**Supabase Dashboard**:
- Query performance
- Database size
- Connection pool status

---

## Troubleshooting

### Frontend Build Issues

```bash
# Clear build cache
npm run clean
npm run build

# Check for missing dependencies
npm list
```

### API Connection Issues

1. **Check CORS**: Next.js should handle CORS automatically
2. **Verify domain**: Ensure `NEXT_PUBLIC_API_URL` matches backend domain
3. **Check logs**: Review Cloudflare Pages deployment logs

### Database Connection Issues

```bash
# Test connection locally
python -c "from app.database import engine; print(engine.connect())"
```

---

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Monitoring and alerts active
- [ ] Backup strategy in place
- [ ] Error tracking enabled (Sentry)
- [ ] Rate limiting configured
- [ ] CDN cache headers set
- [ ] Security headers configured

---

## Quick Deploy Commands

```bash
# Frontend: Deploy to Cloudflare Pages (via GitHub)
git push origin main

# Backend: Deploy to Railway
railway up

# Backend: Deploy to Fly.io
fly deploy

# Database: Create backup (Supabase)
# Use Supabase dashboard or CLI
```

---

## Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Railway Docs**: https://railway.app/docs
- **Supabase Docs**: https://supabase.com/docs
