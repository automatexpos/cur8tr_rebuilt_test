# Vercel Environment Variables Checklist

## Required Environment Variables for Production

Copy this checklist and verify each variable in your Vercel Dashboard:

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

---

### ✅ SUPABASE_URL
- [ ] Variable is set
- [ ] Value starts with `https://`
- [ ] Value ends with `.supabase.co`
- [ ] Format: `https://yourprojectref.supabase.co`
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**Where to find:** Supabase Dashboard → Settings → API → Project URL

**Example:** `https://nagsbnmeftxqfuzjabun.supabase.co`

---

### ✅ SUPABASE_KEY
- [ ] Variable is set
- [ ] Using **service_role** key (NOT anon key)
- [ ] Value is very long (starts with `eyJ`)
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**Where to find:** Supabase Dashboard → Settings → API → Project API keys → Click "Reveal" on `service_role` key

**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...` (very long)

---

### ✅ SUPABASE_DB_PASSWORD
- [ ] Variable is set
- [ ] Value is your actual database password
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**Where to find:** The password you set when creating your Supabase project. If you forgot it, you can reset it in Supabase Dashboard → Settings → Database → Database password → Reset password

**Example:** `your_secure_password_123`

---

### ✅ SESSION_SECRET
- [ ] Variable is set
- [ ] Value is a random string (at least 32 characters)
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**How to generate:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
$bytes = New-Object byte[] 32; (New-Object Random).NextBytes($bytes); [Convert]::ToBase64String($bytes)
```

**Example:** `dGhpc2lzYXJhbmRvbXN0cmluZzEyMzQ1Njc4OQ==`

---

### ✅ NODE_ENV
- [ ] Variable is set
- [ ] Value is exactly: `production`
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**Value:** `production`

---

### ✅ DATABASE_URL (Optional but Recommended)
- [ ] Variable is set
- [ ] Uses pooler endpoint format
- [ ] Format: `postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres`
- [ ] No extra spaces before/after the value
- [ ] Set for: **Production** environment

**Format:**
```
postgresql://postgres.{PROJECT_REF}:{SUPABASE_DB_PASSWORD}@aws-0-{REGION}.pooler.supabase.com:6543/postgres
```

**Example:**
```
postgresql://postgres.nagsbnmeftxqfuzjabun:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Where to find the pooler URL:** Supabase Dashboard → Settings → Database → Connection pooling

**Common regions:**
- `aws-0-us-east-1.pooler.supabase.com:6543` (US East)
- `aws-0-eu-west-1.pooler.supabase.com:6543` (EU West)
- `aws-0-ap-southeast-1.pooler.supabase.com:6543` (Asia Pacific)

---

## After Setting All Variables

### Step 1: Verify All Variables
In Vercel, you should see all 5-6 variables listed with "Production" environment tag.

### Step 2: Redeploy
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click three dots (•••) → **Redeploy**
4. **Uncheck** "Use existing Build Cache"
5. Click **Redeploy**

### Step 3: Check Logs
1. After deployment completes, click on the deployment
2. Go to **Functions** tab
3. Click on any function to see logs
4. Verify no environment variable errors

---

## Quick Test

After deployment, test these endpoints:

1. **Homepage:** `https://your-app.vercel.app/`
   - Should load without errors

2. **API Health Check:** `https://your-app.vercel.app/api/health`
   - Should return 200 OK

3. **Login:** Try logging in with a test account
   - Should not see database connection errors

---

## Common Issues

### Issue: Variables Not Taking Effect
**Solution:** Environment variables only apply to NEW deployments. You must redeploy after changing them.

### Issue: Variables Show as Set but Still Getting Errors
**Solution:** 
1. Delete the variable in Vercel
2. Re-add it (copy-paste carefully)
3. Make sure "Production" is selected
4. Redeploy

### Issue: Can't Find service_role Key
**Solution:** 
1. Go to Supabase Dashboard
2. Settings → API
3. Scroll down to "Project API keys"
4. Find `service_role` (NOT `anon`)
5. Click "Reveal" to see the key
6. Copy the entire key

### Issue: Wrong Pooler Region
**Solution:**
1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection pooling"
3. Look at the connection string shown there
4. Use that exact endpoint in your DATABASE_URL

---

## Need Help?

If you've completed this checklist and still have issues:

1. Check the **Function Logs** in Vercel for specific error messages
2. Verify your Supabase project is not paused
3. Test the database connection locally with the same credentials
4. Review `VERCEL_DB_FIX.md` for troubleshooting steps
