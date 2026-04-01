# MarketLens Cloudflare Deployment - Quick Start

This guide will get your MarketLens app running on Cloudflare in 15 minutes.

## Prerequisites

1. **Cloudflare Account** - Free or paid  
2. **Domain** - Registered and using Cloudflare nameservers  
3. **GitHub Account** - For CI/CD integration  
4. **Account IDs** - Available at https://dash.cloudflare.com

---

## 🚀 Quick Deploy (5 minutes)

### Step 1: Deploy Frontend to Cloudflare Pages

```bash
# 1.1 Install wrangler CLI
npm install -g @cloudflare/wrangler

# 1.2 Authenticate with Cloudflare
wrangler login

# 1.3 Create project
cd frontend
wrangler pages project create marketlens-frontend

# 1.4 Build and deploy
npm run build:cf
wrangler pages deploy .next
```

**Your frontend is now live at**: `marketlens-frontend.pages.dev`

### Step 2: Deploy Backend

#### **Option A: Railway (Recommended - 2 minutes)**

```bash
# 2.1 Install Railway CLI
npm install -g @railway/cli

# 2.2 Login
railway login

# 2.3 Create and deploy
cd backend
railway init
railway up

# 2.4 Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set SECRET_KEY=your-secret-key
railway variables set OPENAI_API_KEY=your-key
```

**Your backend will be live at**: `marketlens-api-prod.up.railway.app`

#### **Option B: Fly.io (Alternative)**

```bash
# 2.1 Install flyctl
brew install flyctl  # or visit https://fly.io/docs/getting-started/installing-flyctl/

# 2.2 Login
fly auth login

# 2.3 Create and deploy
cd backend
fly apps create marketlens-api
fly deploy

# 2.4 Set secrets
fly secrets set DATABASE_URL=postgresql://...
fly secrets set SECRET_KEY=your-secret-key
fly secrets set OPENAI_API_KEY=your-key

# Check status
fly status
```

**Your backend will be live at**: `marketlens-api.fly.dev`

### Step 3: Connect Frontend to Backend

Update `frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Redeploy frontend:

```bash
npm run build:cf
wrangler pages deploy .next
```

---

## 📦 Setting Up Database (PostgreSQL)

### Using Supabase (Recommended)

1. **Create account** at https://supabase.com
2. **Create new project** - Choose region closest to you
3. **Copy connection string** from Settings → Database
4. **Set in backend**:
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   # OR
   fly secrets set DATABASE_URL=postgresql://...
   ```

### One-Time: Run Database Migrations

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

# If using Alembic
alembic upgrade head

# Seed demo data
python seed.py
```

---

## 🔗 Connect Domain

### 1. Point Domain to Cloudflare

- Update your domain registrar's nameservers to:
  - `amber.ns.cloudflare.com`
  - `nacho.ns.cloudflare.com`
- Wait 24 hours for propagation

### 2. Configure Cloudflare DNS

Go to Cloudflare Dashboard → DNS:

```
Record Type | Name             | Content
CNAME       | www              | marketlens-frontend.pages.dev
CNAME       | api              | marketlens-api-prod.up.railway.app
A           | (root domain)    | Set to Cloudflare IP
```

### 3. Enable HTTPS

Cloudflare → SSL/TLS → Set to "Full"

---

## 🔐 Environment Variables

### Backend (Railway/Fly)

```bash
DATABASE_URL=postgresql://user:password@host/db
SECRET_KEY=your-very-long-random-string-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://marketlens.com,https://www.marketlens.com,https://*.pages.dev
```

### Frontend (Cloudflare Pages)

```bash
NEXT_PUBLIC_API_URL=https://api.marketlens.com
NEXT_PUBLIC_APP_NAME=MarketLens
NODE_ENV=production
```

---

## ✅ Testing Deployment

### Check Frontend

```bash
curl https://marketlens-frontend.pages.dev
```

### Check Backend

```bash
curl https://your-backend-url.com/health
```

### Check API Connection

```bash
# Should return expected API response
curl https://api.marketlens.com/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Troubleshooting

### Frontend Won't Deploy

```bash
# Check build output
npm run build

# Check for Next.js errors
npm run lint
```

### Backend Connection Timeout

```bash
# Check backend is running
railway logs  # or fly logs
railway open  # or fly open

# Check URL
railway variables list  # or fly secrets list
```

### CORS Errors

Add to backend `.env`:

```bash
ALLOWED_ORIGINS=https://marketlens.com,https://www.marketlens.com,https://marketlens-frontend.pages.dev
```

Then redeploy:
```bash
railway up  # or fly deploy
```

---

## 📊 Monitoring

### Cloudflare Pages Analytics

Dashboard → Pages → Your Project → Analytics

### Backend Logs

```bash
# Railway
railway logs

# Fly.io
fly logs
```

### Database

Go to Supabase Dashboard → Logs/Performance

---

## 💰 Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| Cloudflare | ✅ | $20+/month |
| Cloudflare Pages | ✅ | Included |
| Railway | 5 GB/month | $5-50/month |
| Supabase | 500 MB DB | $25+/month |
| **Total** | - | **~$25-75/month** |

---

## 🎯 Next Steps (Optional)

- [ ] Set up GitHub Actions CI/CD
- [ ] Configure custom domain
- [ ] Add monitoring/alerts (Sentry, Datadog)
- [ ] Enable database backups
- [ ] Set up scaling policies
- [ ] Add CDN caching rules

---

## 📚 Full Documentation

For more details, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

---

## 🆘 Still Need Help?

Join the community or check docs:
- **Cloudflare**: https://developers.cloudflare.com
- **Next.js**: https://nextjs.org/docs
- **Railway**: https://railway.app/docs
- **Supabase**: https://supabase.com/docs
