# Vercel Deployment Guide

## Prerequisites

1. A Supabase account and project
2. A Vercel account
3. Your database tables created (run the SQL migration)

## Step 1: Prepare Your Database

### Run the SQL Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20251105_initial_schema.sql`
5. Click **Run** to create all tables

## Step 2: Set Up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Where to Find |
|--------------|-------|---------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_KEY` | Your service role key | Supabase Dashboard → Settings → API → Project API keys → `service_role` |
| `SUPABASE_DB_PASSWORD` | Your database password | The password you set when creating your Supabase project |
| `SESSION_SECRET` | A random string | Generate with: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | See format below |
| `NODE_ENV` | `production` | - |

### DATABASE_URL Format

```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:helloworld@db.nagsbnmeftxqfuzjabun.supabase.co:5432/postgres
```

Replace:
- `YOUR_PASSWORD` with your `SUPABASE_DB_PASSWORD`
- `YOUR_PROJECT_REF` with your project reference (from your `SUPABASE_URL`)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Git Integration

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`
6. Add all environment variables (see Step 2)
7. Click **Deploy**

## Step 4: Verify Deployment

1. Once deployed, visit your Vercel URL
2. Test the following:
   - Homepage loads correctly
   - Login functionality works
   - API endpoints respond correctly

## Local Development

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Cur8trRebuild
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Supabase credentials

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5000

### Testing Locally

1. Create a test user by going to http://localhost:5000/api/login
2. Enter any email (e.g., `test@example.com`)
3. The system will auto-create a user for development

## Troubleshooting

### Database Connection Issues

**Error: "Tenant or user not found"**
- Make sure you're using the direct connection (port 5432)
- Not the pooler connection (port 6543)
- Format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

**Error: "password authentication failed"**
- Verify your database password is correct
- Reset it in Supabase: Settings → Database → Database password

### Build Errors

**Error: "Cannot find module"**
```bash
npm install
npm run build
```

**Error: Missing environment variables**
- Ensure all required env vars are set in Vercel
- Check they match the format in `.env.example`

### Session/Auth Issues

**Users can't stay logged in**
- Verify `SESSION_SECRET` is set
- Check that the `sessions` table was created
- Ensure cookies are enabled

### API Errors

**500 Internal Server Error**
- Check Vercel function logs
- Verify database connection
- Ensure all tables are created

## Performance Optimization

### Database Indexes

All necessary indexes are created by the migration SQL. Monitor query performance in Supabase Dashboard → Database → Query Performance.

### Vercel Configuration

- Functions are automatically optimized
- Static assets are served via Vercel CDN
- API routes are serverless functions

### Caching

Consider adding caching headers for static content in production:

```typescript
// In server/index.ts for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/client', {
    maxAge: '1d',
    etag: true
  }));
}
```

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Page views
- Performance metrics
- User insights

### Supabase Monitoring

Monitor your database:
- Dashboard → Database → Database Health
- Check connection pooling
- Monitor query performance

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] `SESSION_SECRET` is a strong random string
- [ ] Using `service_role` key (not `anon` key) for server
- [ ] Database password is strong
- [ ] Row Level Security policies are enabled in Supabase
- [ ] HTTPS is enabled (automatic on Vercel)

## Updating the Deployment

### Push Updates

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy on push to main branch.

### Manual Deployment

```bash
vercel --prod
```

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review error messages in browser console
4. Verify environment variables are correct

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
