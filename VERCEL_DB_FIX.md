# Vercel Database Connection Fix

## Common Errors

### Error 1: `ENOTFOUND db.nagsbnmeftxqfuzjabun.supabase.co`
This error occurs because Vercel's serverless environment cannot connect to Supabase's direct database endpoint.

### Error 2: `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`
This error occurs when the `SUPABASE_URL` environment variable is not set or has an invalid value in Vercel.

## Solution

### Step 0: Verify ALL Environment Variables Are Set in Vercel

**CRITICAL:** Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Make sure these are ALL set correctly:

| Variable | Example Value | Where to Find |
|----------|--------------|---------------|
| `SUPABASE_URL` | `https://nagsbnmeftxqfuzjabun.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_KEY` | `eyJhbGc...` (long string) | Supabase Dashboard → Settings → API → `service_role` key |
| `SUPABASE_DB_PASSWORD` | Your database password | Password you set when creating Supabase project |
| `SESSION_SECRET` | Any random string | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Literal value |

**Common Issues:**
- ❌ Extra spaces before/after the values
- ❌ Missing `https://` in SUPABASE_URL
- ❌ Using `anon` key instead of `service_role` key for SUPABASE_KEY
- ❌ Variables not set for Production environment

### Step 1: Update DATABASE_URL in Vercel (Optional)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add or update `DATABASE_URL` to use the **Pooler endpoint**:

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

After updating the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click the three dots menu (•••)
4. Click **Redeploy**
5. Make sure to check "Use existing Build Cache" is UNCHECKED
6. Click **Redeploy** to confirm

**Important:** Changes to environment variables only take effect after a redeploy!

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

## Troubleshooting Checklist

If you're still getting errors after following the steps above:

### 1. Check Environment Variables in Vercel
```
✓ SUPABASE_URL starts with https://
✓ SUPABASE_URL ends with .supabase.co
✓ SUPABASE_KEY is the service_role key (very long string starting with eyJ)
✓ SUPABASE_DB_PASSWORD is correct
✓ All variables have no extra spaces
✓ Variables are set for "Production" environment (check the dropdown)
```

### 2. Verify Your Supabase Project is Active
- Go to Supabase Dashboard
- Make sure project is not paused
- Check database is running (Settings → Database)

### 3. Test Connection String Format
Your DATABASE_URL should look like:
```
postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres
```

Example with real values:
```
postgresql://postgres.nagsbnmeftxqfuzjabun:mypassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 4. Check Vercel Logs
- Go to Vercel → Your Project → Deployments
- Click on the latest deployment
- Click "View Function Logs"
- Look for the specific error message

### 5. Common Error Messages and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL` | SUPABASE_URL not set or invalid | Add `https://yourproject.supabase.co` to Vercel env vars |
| `ENOTFOUND db.xxxxx.supabase.co` | Using direct DB connection | Use pooler URL as shown above |
| `password authentication failed` | Wrong password | Check SUPABASE_DB_PASSWORD in Vercel |
| `Connection terminated unexpectedly` | Network/timeout issue | Increase `connect_timeout` or check Supabase status |

### 6. Still Not Working?

1. **Delete and re-add environment variables** in Vercel (sometimes they get corrupted)
2. **Redeploy from scratch** (don't use cache)
3. **Check if Supabase has connection pooling enabled** (it should be by default)
4. **Verify your Supabase project region** matches the pooler endpoint region
