# Migration Summary: Replit → Vercel + Supabase

## ✅ Completed Changes

### 1. Configuration Files Created
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `api/index.js` - Serverless function entry point
- ✅ `.env.example` - Environment variables template
- ✅ `DEPLOYMENT.md` - Comprehensive deployment guide

### 2. Package.json Updates
- ✅ Updated scripts for Vercel deployment:
  - `build` now runs both client and server builds
  - `build:client` - Vite build for frontend
  - `build:server` - esbuild for backend (with proper externals)
  - `vercel-build` - Vercel-specific build hook
  - `dev` - Uses `cross-env` for cross-platform compatibility

- ✅ Removed Replit-specific dependencies:
  - `@replit/vite-plugin-cartographer`
  - `@replit/vite-plugin-dev-banner`
  - `@replit/vite-plugin-runtime-error-modal`

- ✅ Added required dependencies:
  - `@supabase/supabase-js` - Supabase client SDK
  - `postgres` - PostgreSQL client for Drizzle
  - `cross-env` - Cross-platform environment variables

### 3. Database Migration (server/db.ts)
- ✅ Replaced `@neondatabase/serverless` with `postgres` + Supabase
- ✅ Added Supabase client initialization
- ✅ Updated connection string to use Supabase pooler (port 6543)
- ✅ Configured for serverless environment (max: 1 connection)
- ✅ Added connection logging (with password masking)
- ✅ Removed WebSocket dependency (ws package)

### 4. Server Updates (server/index.ts)
- ✅ Added default export for Vercel serverless compatibility
- ✅ Conditionally start server (only when `VERCEL !== '1'`)
- ✅ Added HOST environment variable support

### 5. Vite Configuration (vite.config.ts)
- ✅ Removed all Replit-specific plugins:
  - `runtimeErrorOverlay`
  - `cartographer`
  - `devBanner`
- ✅ Simplified plugin array

### 6. Version Control (.gitignore)
- ✅ Added `.env` and `.env.*` patterns
- ✅ Added `.vercel/` directory
- ✅ Added common IDE folders

### 7. Documentation
- ✅ Created comprehensive `DEPLOYMENT.md`
- ✅ Created `.env.example` with clear instructions

## 🔧 Required Manual Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@supabase/supabase-js@^2.48.1`
- `postgres@^3.4.5`
- `cross-env@^7.0.3`

And remove:
- Replit-specific packages

### 2. Optional Cleanup
You may want to remove these unused packages:

```bash
npm uninstall @neondatabase/serverless
```

Note: The migration uses `postgres` instead of `@neondatabase/serverless`.

### 3. Set Up Supabase

1. **Create Supabase Project**: https://app.supabase.com
2. **Get Credentials**:
   - Project URL (Settings → API)
   - Service Role Key (Settings → API)
   - Database Password (Settings → Database)
   - Connection Pooler String (Settings → Database → Connection Pooler → Transaction mode)

3. **Update Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials
   - Generate SESSION_SECRET: `openssl rand -base64 32`

4. **Run Migrations**:
   ```bash
   npm run db:push
   ```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:5000

### 5. Deploy to Vercel

**Option A: GitHub Integration (Recommended)**
1. Push to GitHub
2. Import repository in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🌍 Environment Variables Required

Set these in Vercel Project Settings → Environment Variables:

| Variable | Source | Example |
|----------|--------|---------|
| `SUPABASE_URL` | Supabase Dashboard | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase Dashboard (service_role) | `eyJhbG...` |
| `SUPABASE_DB_PASSWORD` | Supabase Dashboard | Your DB password |
| `DATABASE_URL` | Supabase Dashboard (Pooler) | `postgresql://postgres...6543/postgres` |
| `SESSION_SECRET` | Generate locally | `openssl rand -base64 32` |
| `NODE_ENV` | Manual | `production` |

## ⚠️ Important Notes

### Database Connection
- **MUST use Connection Pooler** (port 6543) for Vercel serverless
- **NOT** the direct connection (port 5432)
- Format: `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Build Process
- Client builds to `dist/public/`
- Server builds to `dist/index.js`
- API route entry point is `api/index.js`

### File to Potentially Delete
- `server/replitAuth.ts` - Not imported anywhere, can be safely deleted

### Auth System
- The project already uses `server/auth.ts` with Passport.js
- `replitAuth.ts` was Replit-specific and is not used

## 🧪 Testing Checklist

Before deploying to production, test:

- [ ] Local development server runs (`npm run dev`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Production server starts locally (`npm start`)
- [ ] Database connection works
- [ ] User registration/login works
- [ ] API endpoints respond correctly
- [ ] File uploads work (if using storage)
- [ ] Environment variables are correctly set

## 📊 Performance Optimizations

The migration includes several serverless optimizations:

1. **Connection Pooling**: Limited to 1 connection (serverless best practice)
2. **Connection Timeouts**: Set to 20s idle, 30s connect
3. **SSL Required**: For security
4. **Statement Caching**: Handled by postgres driver

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install`

### Issue: Database connection timeout
**Solution**: Verify you're using the pooler URL (port 6543), not direct connection

### Issue: API routes 404 on Vercel
**Solution**: Ensure `api/index.js` exists and properly exports the Express app

### Issue: Build fails on Vercel
**Solution**: Check that all dependencies are in `package.json` (not just devDependencies)

### Issue: Sessions not persisting
**Solution**: Ensure `SESSION_SECRET` is set in Vercel environment variables

## 📈 Next Steps

After successful deployment:

1. Set up custom domain in Vercel
2. Configure CORS if needed for external API access
3. Set up monitoring/logging (Vercel Analytics, Sentry, etc.)
4. Enable Supabase RLS (Row Level Security) for additional security
5. Set up CI/CD pipeline for automated testing
6. Configure backup strategy for Supabase database

## 🎉 Migration Complete!

Your CUR8tr application is now ready for Vercel deployment with Supabase as the backend!

For detailed deployment instructions, see `DEPLOYMENT.md`.
