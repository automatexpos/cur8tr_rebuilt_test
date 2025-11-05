# 🚀 Quick Deploy Commands

## Pre-Deployment Validation

Run this first to ensure everything is ready:

```bash
npm run check:production
```

## Local Testing

### Test the production build locally:

```bash
# Build everything
npm run build

# Preview production build
npm run preview
```

The app will run at `http://localhost:5000` in production mode.

## Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Production ready for Vercel deployment"

# 4. Create GitHub repository and add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 5. Push to GitHub
git push -u origin main
```

Then:
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel auto-detects settings from `vercel.json`
5. Add environment variables (see below)
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Environment Variables Setup

### Get Supabase Credentials

1. Go to https://app.supabase.com
2. Open your project
3. Navigate to **Settings** → **Database**
   - Copy **Connection pooler** URL (Transaction mode, port 6543)
   - This is your `DATABASE_URL`
4. Navigate to **Settings** → **API**
   - Copy **Project URL** → This is `SUPABASE_URL`
   - Copy **service_role** key → This is `SUPABASE_KEY`
5. Get your database password (set during project creation)

### Generate Session Secret

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Add to Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbG...
SUPABASE_DB_PASSWORD=your_db_password
SESSION_SECRET=your_generated_secret
NODE_ENV=production
```

**Important Notes:**
- ✅ Use **Transaction Pooler** URL (port 6543) for serverless
- ✅ Use **service_role** key, not anon key
- ✅ Apply variables to "Production" environment
- ❌ Don't use direct connection (port 5432)

## Database Migration

After first deployment, push database schema:

```bash
# Using local environment with Supabase credentials
npm run db:push
```

Or use Supabase SQL Editor to run migrations manually.

## Verify Deployment

### Check these endpoints:

```bash
# Homepage
https://your-app.vercel.app/

# Health check
https://your-app.vercel.app/api/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "2025-11-06T...",
#   "environment": "production",
#   "version": "1.0.0"
# }
```

### Test features:
- [ ] User registration works
- [ ] User login works  
- [ ] Create recommendation works
- [ ] View recommendations works
- [ ] Upload images works
- [ ] Maps display correctly

## Monitoring Setup

### Health Check Monitoring

Add to your monitoring service (UptimeRobot, Pingdom, etc.):

```
URL: https://your-app.vercel.app/api/health
Method: GET
Expected: 200 OK
Check interval: 5 minutes
```

### Vercel Analytics

Enable in Vercel Dashboard:
- Project Settings → Analytics → Enable

### Function Logs

View in Vercel Dashboard:
- Project → Functions → Select function → View logs

## Rollback (If Needed)

```bash
# Via Vercel CLI
vercel rollback

# Or in Vercel Dashboard:
# Deployments → Previous deployment → Promote to Production
```

## Update Environment Variables

```bash
# Via Vercel CLI
vercel env add VARIABLE_NAME production

# Or in Vercel Dashboard:
# Settings → Environment Variables → Edit
```

## Redeploy

### Trigger redeploy without code changes:

```bash
# Via CLI
vercel --prod --force

# Or in Vercel Dashboard:
# Deployments → Latest → Redeploy
```

## Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run check           # Type check

# Production
npm run build           # Build for production
npm run preview         # Preview production build
npm run check:production # Validate production readiness

# Database
npm run db:push         # Push schema to database
npm run db:generate     # Generate migrations

# Deployment
vercel                  # Deploy to preview
vercel --prod          # Deploy to production
vercel logs            # View logs
vercel env ls          # List environment variables
```

## Troubleshooting

### Build fails in Vercel

```bash
# Check logs in Vercel dashboard
# Common fixes:

# 1. Clear cache and redeploy
# Settings → General → Clear Cache

# 2. Verify all dependencies are in package.json
npm install <missing-package> --save

# 3. Test build locally first
npm run build
```

### Database connection errors

```bash
# Verify pooler URL format (port 6543):
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Test connection locally:
# Add DATABASE_URL to .env and run:
npm run dev
```

### API routes return 404

```bash
# Check build output:
# - dist/public/ should contain client files
# - dist/index.js should exist

# Verify in vercel.json:
# - rewrites are configured
# - functions are defined

# Rebuild:
npm run build
```

## Success! 🎉

Your app is now live at: `https://your-app.vercel.app`

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring
3. Enable analytics
4. Set up error tracking
5. Configure backups

---

**Need help?** Check:
- `README.md` - Project overview
- `PRODUCTION_DEPLOY.md` - Detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step
- `PRODUCTION_READY.md` - Summary of changes
