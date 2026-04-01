# ✅ Correct Cloudflare Deployment Steps

The previous error was due to misconfigured `wrangler.toml` files. This guide shows the correct way to deploy.

---

## 🔧 Fixed Configuration

### Issue (What Was Wrong)
- Root `wrangler.toml` was trying to be both **Pages** and **Worker** config
- Invalid fields for Worker configuration
- Using `wrangler deploy` instead of `wrangler pages deploy`

### Solution (What's Fixed)
- ✅ Root `wrangler.toml` - Now optional, only for Worker API proxy
- ✅ `frontend/wrangler.toml` - Proper Cloudflare Pages config
- ✅ GitHub Actions - Uses correct `cloudflare/pages-action@v1`
- ✅ Deploy script - Uses `wrangler pages deploy`

---

## 🚀 Deployment Methods

### Method 1: Via GitHub (RECOMMENDED)
Automatic deployment on push to main branch.

**Setup:**
1. Push code to GitHub
2. Cloudflare Dashboard → Pages → Connect to Git
3. Select `ecomm_analyst` repo, branch `main`
4. Set build command: `npm run build`
5. Set output directory: `frontend/.next`
6. Set environment variables in dashboard
7. Done! Auto-deploys on every push

### Method 2: Via CLI (Local)
Manual deployment from your computer.

```bash
# Install wrangler
npm install -g @cloudflare/wrangler

# Authenticate
wrangler login

# Build
cd frontend
npm run build

# Deploy to Pages
wrangler pages deploy .next --project-name=marketlens-frontend
```

### Method 3: Via Deployment Script
Use the included script.

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ GitHub Secrets Required

For CI/CD to work, add these secrets to your GitHub repo:

**Settings → Secrets and variables → Actions**

```
CLOUDFLARE_API_TOKEN    = Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID   = Your Cloudflare Account ID
```

**Optional Variables:**

```
NEXT_PUBLIC_API_URL     = https://your-backend-api.com
NEXT_PUBLIC_APP_NAME    = MarketLens
```

---

## 📋 Cloudflare Dashboard Setup

1. **Create Pages Project**
   - Cloudflare Dashboard → Pages
   - Click "Create a project" → "Connect to Git"
   - Select GitHub repo and authorize
   - Choose `ecomm_analyst` repo
   - Select branch: `main`

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `frontend/.next`
   - Root directory: `frontend`

3. **Set Environment Variables**
   - Click Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend.com`
     - `NEXT_PUBLIC_APP_NAME` = `MarketLens`

4. **Deploy**
   - Push to main branch
   - Cloudflare automatically builds and deploys

---

## 🔍 Verify Deployment

After deployment completes:

```bash
# Check if site is live
curl https://marketlens-frontend.pages.dev

# Check health endpoint
curl https://marketlens-frontend.pages.dev/

# Check API connectivity (in browser console)
# Should see API calls to your backend
```

---

## 🐛 Troubleshooting

### "Missing entry-point" Error
**Cause:** Using wrong wrangler command  
**Fix:** Use `wrangler pages deploy` not `wrangler deploy`

### "Cannot find .next folder"
**Cause:** Build didn't run or output path wrong  
**Fix:** Verify build command ran successfully and output is in `frontend/.next`

### "Deployment fails"
**Steps:**
1. Check GitHub Actions log for error message
2. Verify `npm run build` works locally:
   ```bash
   cd frontend
   npm run build
   ```
3. Check environment variables are set in Cloudflare dashboard
4. Check API URL is reachable in `NEXT_PUBLIC_API_URL`

---

## 📊 Architecture (Final)

```
┌──────────────────────────────────────┐
│     Your GitHub Repository           │
│   (Code + .github/workflows)          │
└──────────────┬───────────────────────┘
               │ Push to main
               ▼
┌──────────────────────────────────────┐
│     GitHub Actions CI/CD             │
│  - Runs npm run build                │
│  - Creates build artifacts           │
└──────────────┬───────────────────────┘
               │ Uses cloudflare/pages-action
               ▼
┌──────────────────────────────────────┐
│   Cloudflare Pages                   │
│   ✅ https://marketlens-frontend...  │
└──────────────────────────────────────┘
               │ API calls to
               ▼
┌──────────────────────────────────────┐
│   Your Backend API                   │
│   (Railway/Fly.io)                   │
└──────────────────────────────────────┘
               │ Queries
               ▼
┌──────────────────────────────────────┐
│   PostgreSQL Database                │
│   (Supabase)                         │
└──────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. **Verify fixes**
   ```bash
   cd frontend
   npm run build
   ls .next
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "fix: correct cloudflare deployment configuration"
   git push origin main
   ```

3. **Setup GitHub Secrets**
   - Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

4. **Watch deployment**
   - GitHub Actions will automatically deploy
   - Check https://marketlens-frontend.pages.dev

---

**Status:** ✅ Configuration fixed and ready to deploy!
