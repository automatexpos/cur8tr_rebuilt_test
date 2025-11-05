# Vercel Database Connection Fix

## Problem
Error: `ENOTFOUND db.nagsbnmeftxqfuzjabun.supabase.co`

This error occurs because Vercel's serverless environment cannot connect to Supabase's direct database endpoint.

## Solution

### Step 1: Update DATABASE_URL in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL` and update it to use the **Pooler endpoint**:

```
postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Example:**
```
postgresql://postgres.nagsbnmeftxqfuzjabun:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Find Your Correct Pooler Endpoint

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection pooling** section
4. Look for "Connection string" in **Transaction mode** or **Session mode**
5. Use that endpoint in your DATABASE_URL

### Step 3: Verify the Format

Your connection string should have:
- `postgres.YOUR_PROJECT_REF` (NOT `db.YOUR_PROJECT_REF`)
- `pooler.supabase.com:6543` (NOT `.supabase.co:5432`)

### Step 4: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**

## Alternative: Use Environment Variable Only

If you don't want to set DATABASE_URL manually, the code will automatically generate it using the pooler format. Just ensure:
- `SUPABASE_URL` is set
- `SUPABASE_DB_PASSWORD` is set
- `SUPABASE_KEY` is set

## Why This Happens

- **Direct DB connection** (`db.*.supabase.co:5432`): Only works from persistent connections
- **Pooler connection** (`pooler.supabase.com:6543`): Works with serverless/ephemeral connections
- Vercel uses serverless functions, so it requires the pooler

## Testing Locally

If you want to test with the pooler locally:
```bash
# In your .env file, use the pooler URL
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Common Mistakes

❌ **Wrong:**
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

✅ **Correct:**
```
postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Note the differences:
1. `postgres.xxxxx` instead of just `postgres`
2. `pooler.supabase.com:6543` instead of `supabase.co:5432`
3. Region prefix may vary (`aws-0-us-east-1`, `aws-0-eu-west-1`, etc.)
