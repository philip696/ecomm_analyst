# 🎯 Cloudflare Deployment - Step-by-Step CLI Guide

This is a complete copy-paste guide for deploying MarketLens to Cloudflare in 15 minutes.

---

## ⏱️ Time Estimate: 15 minutes total

- Frontend setup: 3 min
- Backend setup: 5 min
- Database setup: 3 min
- Configuration: 4 min

---

## 📋 Prerequisites (Have These Ready)

- [ ] Cloudflare account (https://dash.cloudflare.com)
- [ ] GitHub account with the repo cloned
- [ ] Railway or Fly.io account
- [ ] Supabase account (https://supabase.com)
- [ ] Domain pointed to Cloudflare (optional, can use free .pages.dev domain)

---

## 🚀 Step-by-Step Deployment

### Phase 1: Frontend to Cloudflare Pages (5 min)

```bash
# 1. Navigate to frontend
cd /path/to/ecomm_analyst/frontend

# 2. Install dependencies
npm install

# 3. Build for Cloudflare
npm run build:cf

# 4. Install Wrangler (Cloudflare CLI)
npm install -g @cloudflare/wrangler

# 5. Login to Cloudflare
wrangler login
# This opens a browser to authenticate

# 6. Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name marketlens-frontend

# ✅ Success! Your frontend is at:
# https://marketlens-frontend.pages.dev
```

**Verify Frontend**:
```bash
curl https://marketlens-frontend.pages.dev
# Should see HTML output
```

---

### Phase 2A: Backend to Railway (5 min)

```bash
# 1. Navigate to backend
cd ../backend

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Login to Railway
railway login
# This opens browser for authentication

# 4. Initialize Railway project
railway init

# 5. Link to your Railway project
railway link

# 6. Deploy
railway up

# ✅ Success! Get your URL:
railway open
# Copy the domain, looks like: marketlens-api-prod.up.railway.app
```

---

### Phase 2B: Backend to Fly.io (Alternative - 5 min)

```bash
# 1. Navigate to backend
cd ../backend

# 2. Install Fly CLI (macOS)
brew install flyctl

# 3. Login to Fly.io
fly auth login

# 4. Create app
fly apps create marketlens-api

# 5. Deploy
fly deploy

# ✅ Success! Get your URL:
fly open
# Your backend is at: marketlens-api.fly.dev
```

---

### Phase 3: Database Setup (3 min)

#### Create PostgreSQL on Supabase

1. Go to https://supabase.com
2. Click "New Project"
3. Enter project name: `marketlens`
4. Set password: Use a strong password
5. Select region closest to you
6. Click "Create new project" - wait ~2 min

#### Get Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find "Connection Pooling" section
3. Set mode to "Transaction"
4. Copy the connection string

#### Set Database in Backend

**If using Railway:**
```bash
railway variables set DATABASE_URL="your-postgresql-string-here"
```

**If using Fly.io:**
```bash
fly secrets set DATABASE_URL="your-postgresql-string-here"
```

---

### Phase 4: Environment Variables (4 min)

#### Backend Configuration

**Railway:**
```bash
railway variables set SECRET_KEY="$(openssl rand -hex 32)"
railway variables set ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"
railway variables set OPENAI_API_KEY="sk-... (optional)"
railway variables set ALLOWED_ORIGINS="https://marketlens-frontend.pages.dev"
```

**Fly.io:**
```bash
fly secrets set SECRET_KEY="$(openssl rand -hex 32)"
fly secrets set ALGORITHM="HS256"
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES="30"
fly secrets set OPENAI_API_KEY="sk-... (optional)"
fly secrets set ALLOWED_ORIGINS="https://marketlens-frontend.pages.dev"
```

#### Frontend Configuration

In Cloudflare Pages dashboard:

1. Go to Your Project → Settings → Environment Variables
2. Add variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-domain.com` (from Railway/Fly)
   - **Environments**: Production, Preview

3. Redeploy frontend:
```bash
# Rebuild with new env vars
npm run build:cf
wrangler pages deploy .next --project-name marketlens-frontend
```

---

## ✅ Verification Checklist

### 1. Frontend Loads
```bash
curl https://marketlens-frontend.pages.dev

# Expected: HTML output
```

### 2. Backend Started
```bash
# Get your backend URL from Railway/Fly dashboard

curl https://your-backend-url.com/health

# Expected: {"status":"healthy","service":"marketlens-api"}
```

### 3. API Endpoint Works
```bash
curl https://your-backend-url.com/docs

# Expected: Swagger UI HTML
```

### 4. Can Login
```bash
# Replace with YOUR backend URL
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"demo@example.com",
    "password":"demo1234"
  }'

# Expected: {"access_token":"...","token_type":"bearer"}
```

### 5. Frontend → Backend Connection
1. Open https://marketlens-frontend.pages.dev in browser
2. Login with:
   - **Email**: demo@example.com
   - **Password**: demo1234
3. Dashboard should load with data

---

## 🔗 Setting Up Custom Domain (Optional)

### Add Domain to Cloudflare

1. Go to Cloudflare Dashboard → Domains
2. Add your domain
3. Update nameservers at your registrar to:
   - `amber.ns.cloudflare.com`
   - `nacho.ns.cloudflare.com`

### Configure DNS

1. In Cloudflare → DNS Records:

```
Type  | Name     | Content
------|----------|-----────────────────────────
CNAME | www      | marketlens-frontend.pages.dev
CNAME | api      | marketlens-api-prod.up.railway.app
A     | @        | [Cloudflare default]
```

2. Wait 24-48 hours for DNS propagation
3. Access at `https://marketlens.com`

---

## 🐛 Troubleshooting

### Frontend Won't Build
```bash
# Check for build errors
npm run build

# Check logs in Cloudflare dashboard
# Dashboard → Pages → YourProject → Deployments
```

### Can't Deploy to Cloudflare
```bash
# Re-authenticate
wrangler logout
wrangler login

# Try different project name
wrangler pages deploy .next --project-name marketlens-frontend-v2
```

### Backend No Responding
```bash
# Check logs
railway logs  # or fly logs

# Check environment variables
railway variables list  # or fly secrets list

# Redeploy
railway up  # or fly deploy
```

### API URL Wrong
1. Get correct URL from Railway/Fly dashboard
2. Update in Cloudflare Pages environment variables
3. Rebuild frontend: `npm run build:cf && wrangler pages deploy .next`

### Database Connection Failed
1. Copy the correct PostgreSQL connection string
2. Make sure to use "Transaction" pooling mode
3. Update backend env var
4. Redeploy backend

---

## 📊 Monitoring

### Check Cloudflare Pages Deployment
```bash
wrangler pages project list
wrangler pages deployment list --project-name marketlens-frontend
```

### Check Railway Deployment
```bash
railway logs
railway status
railway domains
```

### Check Fly.io Deployment
```bash
fly status
fly logs
fly urls
```

### Check Database
1. Go to Supabase dashboard → Logs
2. Check recent queries
3. Verify data from seed script

---

## 🎉 Success!

When you see these green checkmarks, you're done:

- ✅ Frontend loads at https://marketlens-frontend.pages.dev
- ✅ Backend responds at https://your-backend-url/health
- ✅ Can login with demo@example.com / demo1234
- ✅ Dashboard displays data
- ✅ No API errors in console

---

## 📞 Support

If something doesn't work:

1. Check troubleshooting section above
2. Review DEPLOYMENT_CHECKLIST.md
3. Check logs in your hosting dashboard
4. Verify environment variables are set correctly
5. Make sure database connection string is correct

---

## 💾 Rollback (If Needed)

### Frontend Rollback
```bash
# Cloudflare automatically keeps deployment history
# In dashboard: Pages → YourProject → Deployments
# Click previous version → Rollback
```

### Backend Rollback
**Railway:**
```bash
railway rollback
```

**Fly.io:**
```bash
fly releases
fly releases rollback
```

---

## 🎯 Next: Going to Production

1. [ ] Set up real domain (not .pages.dev)
2. [ ] Configure HTTPS (Cloudflare handles)
3. [ ] Set up monitoring (Sentry, LogRocket)
4. [ ] Configure database backups
5. [ ] Set up auto-scaling
6. [ ] Add CI/CD via GitHub Actions

See full guide in CLOUDFLARE_DEPLOYMENT.md

---

**That's it! Your app is live! 🚀**
