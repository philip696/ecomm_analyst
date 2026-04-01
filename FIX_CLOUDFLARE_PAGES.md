# 🚀 CORRECT Cloudflare Pages Setup - Fix Deployment Error

The previous error was because **the build command was set to `npx wrangler deploy`** instead of `npm run build`.

**Cloudflare Pages does NOT use wrangler deploy.** It builds Next.js and deploys to Pages automatically.

---

## ❌ What Was Wrong

```
Build Command: npx wrangler deploy  ← WRONG! This tries to deploy a Worker, not Pages
```

## ✅ What Should Be

```
Build Command: npm run build
Build Output: frontend/.next
Root Directory: frontend
```

---

## 🎯 Fix: Configure Cloudflare Pages Correctly

### Step 1: Go to Cloudflare Dashboard

1. Navigate to: https://dash.cloudflare.com
2. Go to **Pages** section
3. Click **Create a project** → **Connect to Git**

### Step 2: Select Repository

- Authorize GitHub
- Select `ecomm_analyst` repository
- Select branch: `main`

### Step 3: Set Build Configuration

**Framework preset:**
- Select: `Next.js` (if prompted)

**Build settings:**
```
Build Command: npm run build
Build Output directory: frontend/.next
Root directory: frontend
```

### Step 4: Environment Variables

Click **Settings** → **Environment variables** → **Add variables**

```
NEXT_PUBLIC_API_URL = https://your-backend-api.com
NEXT_PUBLIC_APP_NAME = MarketLens
NODE_ENV = production
```

### Step 5: Deploy

Click **Save and Deploy** - Cloudflare will now:
1. Build Next.js app
2. Deploy to `https://marketlens-frontend.pages.dev`
3. Auto-deploys on every push to `main`

---

## ✅ Verification

After ~2-3 minutes, check:

```bash
curl https://marketlens-frontend.pages.dev/
```

Should return HTML (not an error).

---

## 🔄 Automatic Updates

Now when you push to main:

```bash
git push origin main
```

**Cloudflare Pages automatically:**
1. Detects the push
2. Runs `npm run build`
3. Deploys the built app
4. Available at: https://marketlens-frontend.pages.dev

---

## 🆘 If Still Getting Error

1. **Delete the Pages project** and start fresh
2. Go to Cloudflare Dashboard → Pages → Delete project
3. Create new project (follow steps above)
4. Verify build command is `npm run build` (NOT wrangler)
5. Deploy

---

## 📋 What NOT to Do

❌ Don't set build command to: `npx wrangler deploy`  
❌ Don't use root `wrangler.toml` for Pages build  
❌ Don't configure through GitHub Actions for basic deployment  

---

## ✅ What TO Do

✅ Use Cloudflare Dashboard for Pages configuration  
✅ Build command: `npm run build`  
✅ Output directory: `frontend/.next`  
✅ Root directory: `frontend`  

---

## 🤖 GitHub Actions (Optional)

If you want CI/CD automation, GitHub Actions workflow is already configured at:
```
.github/workflows/deploy-frontend.yml
```

But you still need to:
1. Setup Cloudflare Pages project (as above)
2. Add GitHub secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

Then GitHub Actions will auto-deploy on push.

---

**Status: Ready to deploy!** Use Cloudflare Dashboard, NOT `wrangler deploy`.
