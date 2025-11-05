# 🚀 Vercel Production Deployment Checklist

Complete production-ready deployment guide for CUR8tr on Vercel.

## 📋 Production Readiness Checklist

### ✅ Code Migration & Optimization (COMPLETED)
- [x] Created production-ready `vercel.json` with security headers
- [x] Created `api/index.js` serverless entry point
- [x] Optimized `package.json` build scripts with minification
- [x] Removed Replit dependencies
- [x] Added Supabase dependencies
- [x] Updated `server/db.ts` to use Supabase
- [x] Updated `server/index.ts` for serverless environment
- [x] Optimized `vite.config.ts` with code splitting and tree shaking
- [x] Updated `.gitignore` for production files
- [x] Created `.env.example` and `.env.production.example`
- [x] Created `.vercelignore` to reduce deployment size
- [x] Added health check endpoint at `/api/health`
- [x] Configured security headers (X-Frame-Options, CSP, etc.)
- [x] Optimized caching strategies for static assets
- [x] Installed production dependencies

### 🔧 Local Setup (TODO)

- [ ] Copy `.env.example` to `.env`
- [ ] Set up Supabase project at https://app.supabase.com
- [ ] Get Supabase credentials:
  - [ ] `SUPABASE_URL` from Settings → API
  - [ ] `SUPABASE_KEY` (service_role) from Settings → API
  - [ ] `SUPABASE_DB_PASSWORD` from Settings → Database
  - [ ] `DATABASE_URL` (pooler, port 6543) from Settings → Database
- [ ] Generate `SESSION_SECRET`: `openssl rand -base64 32`
- [ ] Update `.env` with all credentials
- [ ] Run `npm run db:push` to create database tables
- [ ] Test locally: `npm run dev`
- [ ] Verify app works at http://localhost:5000

### 🏗️ Build Verification (TODO)

- [ ] Run `npm run build` successfully
- [ ] Check `dist/public/` contains client files
- [ ] Check `dist/index.js` exists
- [ ] Run `npm start` and verify production build works
- [ ] Test all major features:
  - [ ] User registration
  - [ ] User login
  - [ ] Create recommendation
  - [ ] View recommendations
  - [ ] API endpoints respond

### 🌐 Vercel Setup (TODO)

#### Option A: GitHub Integration (Recommended)

- [ ] Initialize Git repository:
  ```bash
  git init
  git add .
  git commit -m "Migrate to Vercel + Supabase"
  ```
- [ ] Create GitHub repository
- [ ] Push code to GitHub:
  ```bash
  git remote add origin https://github.com/yourusername/your-repo.git
  git push -u origin main
  ```
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Project"
- [ ] Select your GitHub repository
- [ ] Vercel will auto-detect settings from `vercel.json`

#### Option B: Vercel CLI

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel --prod`

### 🔐 Environment Variables in Vercel (TODO)

Go to Vercel Project Settings → Environment Variables and add:

- [ ] `SUPABASE_URL` = `https://xxxxxxxxxxxxx.supabase.co`
- [ ] `SUPABASE_KEY` = `eyJhbG...` (service_role key)
- [ ] `SUPABASE_DB_PASSWORD` = `your_database_password`
- [ ] `DATABASE_URL` = `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`
- [ ] `SESSION_SECRET` = `your_generated_secret`
- [ ] `NODE_ENV` = `production`

**Important**: For `DATABASE_URL`, use the **Connection Pooler** URL (port 6543), NOT the direct connection!

### 🚢 Deploy (TODO)

- [ ] Click "Deploy" in Vercel dashboard (or run `vercel --prod`)
- [ ] Wait for build to complete
- [ ] Check deployment logs for any errors
- [ ] Visit your deployed URL
- [ ] Test all major features in production

### ✅ Post-Deployment Verification (TODO)

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Database reads/writes work
- [ ] API endpoints respond correctly
- [ ] Images/assets load properly
- [ ] No console errors in browser
- [ ] Mobile responsive works
- [ ] Check Vercel function logs for errors

### 🔒 Security Hardening (CRITICAL)

- [ ] Verify `.env` is NOT committed to Git
- [ ] Verify all secrets are set in Vercel environment variables
- [ ] Use `.env.production.example` as a reference for all required variables
- [ ] Enable Supabase RLS (Row Level Security) policies
- [ ] Review CORS settings (configure if needed)
- [ ] Verify HTTPS is enabled (Vercel does automatically)
- [ ] Test health check endpoint: `https://yourdomain.vercel.app/api/health`
- [ ] Review and implement API rate limiting
- [ ] Validate all security headers are working (see vercel.json)
- [ ] Ensure no sensitive data in client-side code
- [ ] Review database connection pooling settings

### 📊 Monitoring & Observability (RECOMMENDED)

- [ ] Enable Vercel Analytics for performance tracking
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up database backup schedule in Supabase
- [ ] Configure alerts for:
  - [ ] Function errors/timeouts
  - [ ] High memory usage
  - [ ] Slow API responses (>1s)
  - [ ] Database connection issues
- [ ] Monitor health check endpoint regularly
- [ ] Set up log aggregation for debugging

### 🌟 Performance Optimization (RECOMMENDED)

- [ ] Set up custom domain in Vercel
- [ ] Configure proper caching headers (already in vercel.json)
- [ ] Enable Vercel Edge Network (automatic)
- [ ] Optimize images with next-generation formats
- [ ] Review bundle size (check for large dependencies)
- [ ] Test Core Web Vitals (LCP, FID, CLS)
- [ ] Enable Brotli compression (automatic in Vercel)
- [ ] Configure database indexes for common queries
- [ ] Implement lazy loading for routes and components
- [ ] Use CDN for user-uploaded assets (Supabase Storage)

## 🐛 Common Issues

### Build Fails in Vercel
- Check Vercel logs for specific error
- Ensure all dependencies are in `package.json` (not devDependencies)
- Verify `vercel.json` is correct
- Make sure `NODE_ENV` is set to `production`

### Database Connection Errors
- **Solution**: Use pooler URL (port 6543)
- Verify all Supabase credentials are correct
- Check Supabase project is running
- Test connection locally first

### API Routes Return 404
- Verify `api/index.js` exists
- Check `vercel.json` rewrites configuration
- Ensure server exports Express app as default

### Sessions Not Working
- Set `SESSION_SECRET` in Vercel environment variables
- Verify `sessions` table exists in database
- Check that cookies are being set (browser dev tools)

## 📚 Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - What changed
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 Success!

Once all checkboxes are complete, your CUR8tr app is live on Vercel! 🚀

Share your deployment URL: `https://your-app.vercel.app`

---

**Need Help?** 
- Check the `DEPLOYMENT.md` for detailed instructions
- Review `MIGRATION_SUMMARY.md` for technical details
- Check Vercel deployment logs
- Check Supabase dashboard for database issues
