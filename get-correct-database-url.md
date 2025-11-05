# Get Correct DATABASE_URL from Supabase

## The Error You're Seeing
```
PostgresError: Tenant or user not found
```

This means the pooler connection string format or region is incorrect.

## Solution: Get the Exact Connection String from Supabase

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `nagsbnmeftxqfuzjabun`
3. Go to **Settings** (⚙️ icon in left sidebar)
4. Click **Database**

### Step 2: Find Connection Pooling Section
Scroll down to **"Connection Pooling"** or **"Connection String"** section

### Step 3: Look for These Options

You should see different connection modes:

#### Option A: Transaction Mode (Recommended for Vercel)
```
Use this for serverless/edge functions
Port: 6543
```

#### Option B: Session Mode
```
Use this for long-lived connections
Port: 5432 (pooled)
```

### Step 4: Copy the Connection String

Click to reveal the connection string. It will look like ONE of these formats:

**Format 1 (Supavisor - New pooler):**
```
postgresql://postgres.nagsbnmeftxqfuzjabun:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Format 2 (PgBouncer - Legacy pooler):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.nagsbnmeftxqfuzjabun.supabase.co:6543/postgres
```

**Format 3 (IPv6 Supavisor):**
```
postgresql://postgres.nagsbnmeftxqfuzjabun:[YOUR-PASSWORD]@[REGION].pooler.supabase.com:6543/postgres
```

### Step 5: Update Your .env File

Replace `[YOUR-PASSWORD]` with `helloworld` (your actual password) and paste the EXACT connection string.

---

## Common Issues

### Issue 1: Wrong Region
If you see a different region like:
- `aws-0-us-west-1.pooler.supabase.com` ✅ (West Coast US)
- `aws-0-us-west-2.pooler.supabase.com` ✅ (Oregon)
- `aws-0-eu-west-1.pooler.supabase.com` ✅ (Ireland)
- `aws-0-ap-southeast-1.pooler.supabase.com` ✅ (Singapore)
- `aws-0-ap-northeast-1.pooler.supabase.com` ✅ (Tokyo)

Use THAT region, not `us-east-1`!

### Issue 2: Connection Pooler Not Enabled
If you don't see "Connection Pooling" section:
1. It might be under a different name like "Connection String"
2. Look for "Pooler" or "Transaction Mode"
3. Your project might be on an older version - try the direct connection with port 5432

### Issue 3: Still Not Working?
Try this alternative format (legacy pooler):
```
postgresql://postgres:helloworld@db.nagsbnmeftxqfuzjabun.supabase.co:6543/postgres
```

Note: Uses `postgres:password` instead of `postgres.project:password`

---

## Quick Test Formats to Try

Try these in order until one works:

### Try #1: Supavisor with your actual region
```bash
# Check your Supabase dashboard for the exact region
DATABASE_URL=postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
```

### Try #2: Legacy PgBouncer format
```bash
DATABASE_URL=postgresql://postgres:helloworld@db.nagsbnmeftxqfuzjabun.supabase.co:6543/postgres
```

### Try #3: Session mode pooler
```bash
DATABASE_URL=postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## What to Do Next

1. **Find the correct connection string** from Supabase Dashboard
2. **Update `.env` file** with the correct DATABASE_URL
3. **Update the SAME value in Vercel** environment variables
4. **Redeploy** in Vercel
5. **Test** your login again

---

## Can't Find Connection Pooling?

If you absolutely cannot find the pooling section in your Supabase dashboard:

**Screenshot what you need:**
1. Go to Supabase Dashboard → Settings → Database
2. Take a screenshot of the entire page
3. The connection string should be visible there

Or try using the Supabase CLI:
```bash
npx supabase projects list
npx supabase projects api-keys --project-id nagsbnmeftxqfuzjabun
```
