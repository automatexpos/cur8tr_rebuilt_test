# Production Deployment Guide for Vercel

## 🎯 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cur8tr)

## 📦 What's Included (Production-Ready)

✅ **Optimized Build Configuration**
- Minified JavaScript bundles with tree shaking
- Code splitting for vendor libraries
- Terser optimization with console removal
- Source maps disabled for production

✅ **Security Hardening**
- Security headers (X-Frame-Options, CSP, XSS Protection)
- HTTPS enforced (automatic via Vercel)
- Environment variable protection
- No sensitive data in client bundles

✅ **Performance Optimizations**
- Static asset caching (1 year)
- API response caching disabled
- Gzip/Brotli compression
- Edge network delivery

✅ **Monitoring & Health Checks**
- `/api/health` endpoint for uptime monitoring
- Request/response logging
- Error tracking ready

✅ **Serverless Architecture**
- Node.js 20.x runtime
- 30-second function timeout
- Transaction pooler for database (6543)
- Memory-efficient session storage

## 🚀 Deployment Steps

### 1. Prerequisites

```bash
# Required accounts
- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
```

### 2. Database Setup (Supabase)

1. Create project at https://supabase.com
2. Get credentials from **Settings → Database**:
   - Connection Pooler URL (port 6543) - CRITICAL for serverless
   - Database Password
3. Get API credentials from **Settings → API**:
   - Project URL
   - Service Role Key (anon key won't work)

### 3. Environment Variables

Configure in Vercel Dashboard → Settings → Environment Variables:

**Required (Minimum):**
```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbG...  # service_role key
SUPABASE_DB_PASSWORD=your_db_password
SESSION_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
```

**Optional (Email, Storage, etc.):**
See `.env.production.example` for full list

### 4. Deploy

**Option A: GitHub (Recommended)**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 2. Import in Vercel
# - Go to https://vercel.com/new
# - Select your repository
# - Vercel auto-detects settings from vercel.json
# - Add environment variables
# - Click Deploy
```

**Option B: Vercel CLI**
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Add environment variables interactively
vercel env add DATABASE_URL
vercel env add SUPABASE_URL
# ... add all required variables
```

### 5. Database Migration

After first deployment, run migrations:

```bash
# Local migration (recommended)
npm run db:push

# Or use Supabase SQL Editor
# - Copy SQL from migrations/
# - Run in Supabase dashboard
```

### 6. Verify Deployment

Test these endpoints:
- ✅ Homepage: `https://yourdomain.vercel.app/`
- ✅ Health check: `https://yourdomain.vercel.app/api/health`
- ✅ Login: `https://yourdomain.vercel.app/login`

## 🔍 Troubleshooting

### Build Fails

**Error: "Cannot find module X"**
```bash
# Ensure dependency is in dependencies, not devDependencies
npm install X --save
```

**Error: "TypeScript compilation failed"**
```bash
# Run type check locally first
npm run check
```

### Database Connection Errors

**Error: "Connection timeout" or "too many connections"**
- ✅ USE: Pooler URL (port 6543) - for serverless
- ❌ DON'T USE: Direct connection (port 5432)

Correct format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### API Routes 404

Check:
1. `api/index.js` exists
2. `dist/index.js` built successfully
3. `vercel.json` rewrites configured

### Sessions Not Persisting

Check:
1. `SESSION_SECRET` set in Vercel
2. Database has `sessions` table
3. Cookies allowed in browser

## 📊 Post-Deployment

### Monitoring Setup

1. **Vercel Analytics**
   - Enable in Project Settings → Analytics
   - Free tier includes Web Vitals

2. **Health Monitoring**
   ```bash
   # Add to UptimeRobot or similar
   https://yourdomain.vercel.app/api/health
   # Expected: {"status":"ok","timestamp":"..."}
   ```

3. **Error Tracking**
   - Integrate Sentry, LogRocket, or similar
   - Monitor Vercel function logs

### Performance Optimization

1. **Custom Domain**
   - Add in Vercel: Settings → Domains
   - Configure DNS records

2. **Database Indexes**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
   CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
   ```

3. **Caching Strategy**
   - Static assets: 1 year (configured)
   - API responses: no-cache (configured)
   - User uploads: CDN via Supabase Storage

## 🔐 Security Checklist

- [ ] All environment variables in Vercel (never in code)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced (automatic)
- [ ] Security headers enabled (configured in vercel.json)
- [ ] Database RLS policies enabled in Supabase
- [ ] API rate limiting implemented (if needed)
- [ ] CORS configured for your domains only
- [ ] Sensitive logs disabled in production

## 🎯 Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│  Vercel Edge Network│
│  (CDN + SSL)        │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌────────────────┐
│ Static │  │ API Serverless │
│ Assets │  │ (api/index.js) │
└────────┘  └────────┬───────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │   Supabase   │   │   Supabase   │
    │  PostgreSQL  │   │   Storage    │
    │  (Pooler)    │   │              │
    └──────────────┘   └──────────────┘
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [.env.production.example](./.env.production.example) - All environment variables

## 🆘 Support

- Check Vercel function logs for errors
- Review Supabase logs for database issues
- Test locally with `npm run build && npm start`
- Validate health endpoint returns 200 OK

## ✨ Production-Ready Features

- ✅ Zero-downtime deployments
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN distribution
- ✅ Automatic scaling
- ✅ DDoS protection
- ✅ Rollback capability
- ✅ Preview deployments
- ✅ Git integration

---

**🎉 Your app is now production-ready!**

Deploy URL: `https://yourdomain.vercel.app`
