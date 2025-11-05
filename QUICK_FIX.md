# Quick Fix: Vercel Deployment Errors

## Your Current Error
```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL
```

## What This Means
The `SUPABASE_URL` environment variable is either:
1. Not set in Vercel
2. Has an invalid value (missing `https://`, has extra spaces, etc.)
3. Not applied to the Production environment

## Immediate Action Required

### 1. Go to Vercel Dashboard
```
https://vercel.com/dashboard
→ Select your project
→ Settings tab
→ Environment Variables (left sidebar)
```

### 2. Check if SUPABASE_URL exists
- If it doesn't exist → Add it
- If it exists → Edit it

### 3. Set the Correct Value
```
https://nagsbnmeftxqfuzjabun.supabase.co
```
(Replace `nagsbnmeftxqfuzjabun` with your actual project reference)

**Important Checks:**
- ✅ Must start with `https://`
- ✅ Must end with `.supabase.co`
- ✅ No spaces before or after
- ✅ Select "Production" environment
- ✅ Click "Save"

### 4. Verify ALL Required Variables

You need these 5 variables in Vercel:

| Variable | Example | Required |
|----------|---------|----------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ YES |
| `SUPABASE_KEY` | `eyJhbGc...` (service_role key) | ✅ YES |
| `SUPABASE_DB_PASSWORD` | `your_password` | ✅ YES |
| `SESSION_SECRET` | Random 32+ char string | ✅ YES |
| `NODE_ENV` | `production` | ✅ YES |
| `DATABASE_URL` | Pooler connection string | Optional |

### 5. Where to Find These Values

**SUPABASE_URL:**
```
Supabase Dashboard → Settings → API → Project URL
```

**SUPABASE_KEY:**
```
Supabase Dashboard → Settings → API → Project API keys → service_role (click Reveal)
```

**SUPABASE_DB_PASSWORD:**
```
The password you set when creating your Supabase project
(If forgotten: Supabase Dashboard → Settings → Database → Reset password)
```

**SESSION_SECRET:**
```bash
# Generate a new one:
openssl rand -base64 32
```

### 6. Redeploy
After setting/updating variables:
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click ••• menu → **Redeploy**
4. Uncheck "Use existing Build Cache"
5. Click **Redeploy**

---

## Expected Result

After redeployment, your app should:
- ✅ Load without environment variable errors
- ✅ Connect to Supabase successfully
- ✅ Allow users to log in
- ✅ Show database data

---

## If You Still Get Errors

### Error: "ENOTFOUND db.xxx.supabase.co"
This means the database connection is using the wrong endpoint.

**Fix:** Add DATABASE_URL with pooler format:
```
postgresql://postgres.nagsbnmeftxqfuzjabun:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Error: "password authentication failed"
**Fix:** Double-check your SUPABASE_DB_PASSWORD is correct

### Error: "Connection refused"
**Fix:** Check if your Supabase project is active (not paused)

---

## Full Documentation

For complete details, see:
- `VERCEL_ENV_CHECKLIST.md` - Complete environment variable checklist
- `VERCEL_DB_FIX.md` - Database connection troubleshooting
- `VERCEL_DEPLOYMENT.md` - Full deployment guide

---

## Timeline to Fix

⏱️ **Estimated time: 5-10 minutes**

1. Set environment variables (3-5 min)
2. Redeploy (2-3 min)
3. Test (1-2 min)

---

## Need Help?

Check Vercel Function Logs for specific errors:
```
Vercel Dashboard → Your Project → Deployments → Latest → Functions → View Logs
```

The logs will show you exactly which environment variable is missing or incorrect.
