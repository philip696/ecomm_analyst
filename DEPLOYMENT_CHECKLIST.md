# Deployment Checklist - MarketLens

## Pre-Deployment

- [ ] **Code Review**
  - [ ] All PRs reviewed and approved
  - [ ] No debugging console.log statements
  - [ ] No hardcoded secrets or API keys
  - [ ] Code passes linting

- [ ] **Testing**
  - [ ] Unit tests passing (npm test)
  - [ ] Integration tests passing
  - [ ] E2E tests passing (if applicable)
  - [ ] No broken links or 404s

- [ ] **Security**
  - [ ] CORS configured correctly
  - [ ] HTTPS enabled
  - [ ] No SQL injection vulnerabilities
  - [ ] No XSS vulnerabilities
  - [ ] API keys securely stored in environment variables

- [ ] **Performance**
  - [ ] Build completes in < 5 minutes
  - [ ] Bundle size optimized
  - [ ] Database indexes created
  - [ ] Images optimized

## Frontend Deployment (Cloudflare Pages)

- [ ] **Prepare**
  - [ ] `npm run build` succeeds locally
  - [ ] `.env.production` configured
  - [ ] `NEXT_PUBLIC_API_URL` set correctly
  - [ ] Custom domain configured (if applicable)

- [ ] **Deploy**
  - [ ] Push to main branch
  - [ ] GitHub Actions workflow triggers
  - [ ] Build completes without errors
  - [ ] Cloudflare Pages deployment succeeds

- [ ] **Verify**
  - [ ] Frontend loads at correct URL
  - [ ] API requests succeed (check Network tab)
  - [ ] All pages render correctly
  - [ ] No console errors
  - [ ] Mobile responsive

## Backend Deployment (Railway/Fly)

- [ ] **Prepare**
  - [ ] Dockerfile builds successfully
  - [ ] `requirements.txt` up to date
  - [ ] Python 3.13 specified
  - [ ] All secrets added to vault

- [ ] **Environment Variables**
  - [ ] `DATABASE_URL` set
  - [ ] `SECRET_KEY` configured (min 32 chars)
  - [ ] `OPENAI_API_KEY` set (if using)
  - [ ] `ALLOWED_ORIGINS` includes frontend domain
  - [ ] `PORT` set to `8000`

- [ ] **Deploy**
  - [ ] `railway up` or `fly deploy` succeeds
  - [ ] No build errors
  - [ ] Health check passes
  - [ ] Logs show no critical errors

- [ ] **Verify**
  - [ ] `GET /health` returns 200
  - [ ] `GET /docs` loads Swagger UI
  - [ ] Login endpoint works
  - [ ] Database queries succeed
  - [ ] CORS headers present

## Database Deployment (Supabase/PostgreSQL)

- [ ] **Setup**
  - [ ] Database created
  - [ ] Connection string saved
  - [ ] Backups configured
  - [ ] SSL/TLS enabled

- [ ] **Migrations**
  - [ ] Schema created (alembic upgrade head)
  - [ ] Indexes created
  - [ ] Seeds applied
  - [ ] Demo data loaded

- [ ] **Verify**
  - [ ] Tables exist
  - [ ] Can query data
  - [ ] Backups running
  - [ ] Monitoring enabled

## Post-Deployment

- [ ] **Monitoring**
  - [ ] Errors tracked (Sentry, LogRocket)
  - [ ] Performance monitored
  - [ ] Uptime monitoring enabled
  - [ ] Alerts configured

- [ ] **Logs**
  - [ ] Frontend logs clean
  - [ ] Backend logs clean
  - [ ] Database logs monitored
  - [ ] Error logs reviewed

- [ ] **Functionality**
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Charts display correctly
  - [ ] API endpoints respond
  - [ ] Database queries performant

- [ ] **Documentation**
  - [ ] Deployment documented
  - [ ] Rollback procedure documented
  - [ ] Team notified
  - [ ] Status page updated

## Rollback Procedure (If Needed)

```bash
# Frontend
git revert <commit-hash>
git push origin main
# Cloudflare Pages auto-redeploys

# Backend (Railway)
railway rollback

# Backend (Fly.io)
fly releases
fly releases rollback

# Database
# Manual restore from backup in Supabase dashboard
```

## Post-Deployment Support

If issues arise:

1. **Check logs**:
   - Cloudflare Pages: Dashboard → Logs
   - Railway: `railway logs`
   - Fly.io: `fly logs`
   - Supabase: Logs tab

2. **Verify connectivity**:
   - Frontend → Backend API
   - Backend → Database
   - CORS headers

3. **Check secrets**:
   - All env vars set correctly
   - No typos in variable names
   - URLs match domain names

4. **Rollback if critical**:
   - Use procedure above
   - Test fix locally
   - Redeploy once confirmed

## Monitoring Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Railway Dashboard**: https://railway.app/dashboard
- **Fly.io Dashboard**: https://fly.io/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
