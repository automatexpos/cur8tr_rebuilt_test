# 🚀 Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## 📋 Pre-Deployment Checklist

### ✅ Code Migration (COMPLETED)
- [x] Created `vercel.json` configuration
- [x] Created `api/index.js` serverless entry point
- [x] Updated `package.json` scripts
- [x] Removed Replit dependencies
- [x] Added Supabase dependencies
- [x] Updated `server/db.ts` to use Supabase
- [x] Updated `server/index.ts` for serverless
- [x] Cleaned up `vite.config.ts`
- [x] Updated `.gitignore`
- [x] Created `.env.example`
- [x] Installed new dependencies

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

### 🔒 Security (TODO)

- [ ] Verify `.env` is NOT committed to Git
- [ ] Verify all secrets are set in Vercel (not hardcoded)
- [ ] Enable Supabase RLS (Row Level Security) if needed
- [ ] Review CORS settings if needed
- [ ] Set up HTTPS (Vercel does this automatically)
- [ ] Review API rate limiting needs

### 📊 Monitoring Setup (OPTIONAL)

- [ ] Set up Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Set up database backup schedule in Supabase
- [ ] Configure alerts for function errors

### 🌟 Optimization (OPTIONAL)

- [ ] Set up custom domain in Vercel
- [ ] Configure CDN settings
- [ ] Enable edge caching if applicable
- [ ] Optimize images
- [ ] Review bundle size
- [ ] Enable compression

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
