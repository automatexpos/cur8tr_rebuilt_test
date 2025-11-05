# 🚀 Quick Start: Push to Git & Deploy

## Step 1: Push to GitHub (5 minutes)

### Option A: Automated (Recommended for Windows)
```powershell
.\setup-git.ps1
```
Follow the prompts!

### Option B: Manual
```bash
git init
git add .
git commit -m "feat: production-ready CUR8tr app"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy to Vercel (10 minutes)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
5. Add Environment Variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_service_role_key
   SUPABASE_DB_PASSWORD=your_db_password
   SESSION_SECRET=random_32_char_string
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
   ```
6. Click **"Deploy"**

## Step 3: Run Database Migrations (2 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Run these files in order:
   - `supabase/migrations/20251105_initial_schema.sql`
   - `supabase/migrations/20251105_add_password_to_users.sql`

## Step 4: Test! (5 minutes)

Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Can register account
- ✅ Can login
- ✅ Can create recommendation
- ✅ Can logout

## 🎉 Done!

Total time: ~20 minutes

Need detailed instructions? See [PRE_FLIGHT_CHECKLIST.md](./PRE_FLIGHT_CHECKLIST.md)
