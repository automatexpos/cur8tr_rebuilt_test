# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Ready
Ensure you have the following values ready from your Supabase project:
- [ ] `SUPABASE_URL` (from Settings > API > Project URL)
- [ ] `SUPABASE_KEY` (from Settings > API > service_role key)
- [ ] `SUPABASE_DB_PASSWORD` (your database password)
- [ ] `SESSION_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] `DATABASE_URL` (formatted connection string)

### 2. Code Preparation
- [x] ✅ `.gitignore` updated to exclude `.env` files
- [x] ✅ `.env.example` created with placeholder values
- [x] ✅ `vercel.json` configured
- [x] ✅ `api/index.js` serverless function created
- [x] ✅ Server exports Express app for Vercel
- [x] ✅ Logout functionality implemented
- [x] ✅ Production-ready authentication with bcrypt
- [x] ✅ Database migration files created

### 3. Database Setup
- [ ] Run SQL migration in Supabase SQL Editor
  - File: `supabase/migrations/20251105_initial_schema.sql`
  - File: `supabase/migrations/20251105_add_password_to_users.sql`
- [ ] Verify all tables are created successfully

## 📦 Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files (respecting .gitignore)
git add .

# Commit changes
git commit -m "feat: production-ready app with authentication and logout"

# Add your remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_service_role_key
   SUPABASE_DB_PASSWORD=your_db_password
   SESSION_SECRET=your_random_secret_32_chars_or_more
   DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
   NODE_ENV=production
   ```

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod
```

When prompted, add environment variables via dashboard or CLI.

### Step 3: Verify Deployment

After deployment completes, test the following:

- [ ] Homepage loads correctly
- [ ] Can navigate to `/explore`
- [ ] Can register a new account
- [ ] Can login with email/password
- [ ] Can create a recommendation
- [ ] Logout button appears when logged in
- [ ] Logout works and redirects to homepage
- [ ] Admin features work (if you're an admin)

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Service role key (for admin operations) | `eyJhbGc...` |
| `SUPABASE_DB_PASSWORD` | Database password | `your_secure_password` |
| `SESSION_SECRET` | Secret for session encryption | `generated_32_char_string` |
| `DATABASE_URL` | PostgreSQL connection string | See format below |

### DATABASE_URL Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:mypassword123@db.abc def123xyz.supabase.co:5432/postgres
```

Extract `[PROJECT_REF]` from your `SUPABASE_URL`:
- SUPABASE_URL: `https://abcdef123xyz.supabase.co`
- PROJECT_REF: `abcdef123xyz`

## 🚨 Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use service_role key** - The anon key has limited permissions
3. **Generate strong SESSION_SECRET** - At least 32 random characters
4. **Run migrations first** - Database tables must exist before app starts
5. **Test locally first** - Run `npm run build && npm start` to test production build

## 🔍 Troubleshooting

### Build Fails on Vercel

**Issue**: "Cannot find module..." error
- **Solution**: Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check: `package.json` has all runtime dependencies

### Database Connection Fails

**Issue**: "Connection refused" or "Tenant not found"
- **Solution**: Use direct connection (port 5432), not pooler (port 6543)
- Check: `DATABASE_URL` uses format shown above

### Session/Login Issues

**Issue**: "Session not persisting" or "Login doesn't work"
- **Solution**: Ensure `SESSION_SECRET` is set in Vercel environment variables
- Check: Environment variables are set for **Production** environment

### Static Files Not Loading

**Issue**: CSS/JS files return 404
- **Solution**: Check `vercel.json` rewrites configuration
- Verify: Build output is in `dist/client` directory

## 📝 Post-Deployment Tasks

- [ ] Set up custom domain (optional)
- [ ] Configure Vercel Analytics (optional)
- [ ] Enable automatic deployments from main branch
- [ ] Set up preview deployments for pull requests
- [ ] Add monitoring/error tracking (e.g., Sentry)
- [ ] Update social media preview images
- [ ] Create first admin user in database

## 🎉 Success!

Your CUR8tr app is now live on Vercel! 🚀

Visit your deployment URL and start curating!

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check `VERCEL_DEPLOYMENT.md` for detailed guide
