# CRITICAL: Get Your Supabase Pooler URL

## ⚠️ THE PROBLEM

Vercel **CANNOT** connect to `db.nagsbnmeftxqfuzjabun.supabase.co` - this hostname is not accessible from Vercel's network.

You **MUST** use the pooler endpoint: `aws-0-[region].pooler.supabase.com`

## ✅ THE SOLUTION

### Step 1: Find Your Correct Pooler URL

**Go to Supabase Dashboard:**
1. Open https://supabase.com/dashboard/project/nagsbnmeftxqfuzjabun
2. Click **Settings** (⚙️) in the left sidebar
3. Click **Database**
4. Scroll down to **"Connection Pooling"** section

### Step 2: Look for This

You should see something like:

```
Connection pooling
Transaction mode

Connection string:
postgresql://postgres.nagsbnmeftxqfuzjabun:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Or:

```
Session mode

Connection string:
postgresql://postgres.nagsbnmeftxqfuzjabun:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Step 3: Copy That EXACT URL

- Copy the connection string shown
- Replace `[YOUR-PASSWORD]` with `helloworld`
- That's your DATABASE_URL!

## 🚨 If You Don't See "Connection Pooling"

Your Supabase project might be on an older version or in a different configuration panel.

**Try these locations:**
1. **Settings** → **Database** → Look for any connection strings
2. **Settings** → **API** → Check for database connection info
3. **Project Settings** → **Database Settings**

## 🔍 Alternative: Try Common Regions

If you absolutely cannot find the connection pooling section, try these URLs **one by one**:

### Try #1: US West 1 (California)
```
postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Try #2: US East 1 (Virginia)
```
postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Try #3: US West 2 (Oregon)
```
postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

### Try #4: EU West 1 (Ireland)
```
postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### Try #5: Asia Southeast 1 (Singapore)
```
postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## 📝 How to Test Each URL

1. Update `DATABASE_URL` in your `.env` file with one of the URLs above
2. Update the **same URL** in Vercel environment variables
3. Redeploy in Vercel
4. Check if login works
5. If not, try the next URL

## ⚡ Quick Update Instructions

### Update Locally (.env file):
```env
DATABASE_URL=postgresql://postgres.nagsbnmeftxqfuzjabun:helloworld@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Update in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and click **Edit**
5. Paste the new URL
6. Click **Save**
7. Go to **Deployments** → Click latest → **Redeploy** (without cache)

## 🎯 Expected Behavior

Once you have the correct URL:
- ✅ No more `ENOTFOUND` errors
- ✅ No more `Tenant or user not found` errors
- ✅ Login should work!

## 🆘 Still Can't Find It?

**Last Resort - Contact Supabase Support:**

If you truly cannot find the connection pooling URL in your dashboard:

1. Open the Supabase Discord or Support
2. Provide your project ref: `nagsbnmeftxqfuzjabun`
3. Ask: "What is my connection pooler endpoint for serverless functions?"

They'll give you the exact URL in minutes.

## 📸 What You're Looking For

In the Supabase Dashboard under Database settings, you should see something like:

```
┌─────────────────────────────────────────┐
│ Connection Pooling                       │
├─────────────────────────────────────────┤
│ Mode: Transaction                        │
│ Pool Size: 15                            │
│                                          │
│ Connection String:                       │
│ postgresql://postgres.xxxxx:****@        │
│ aws-0-us-west-1.pooler.supabase.com:6543│
│ /postgres                                │
│                                          │
│ [Copy]                                   │
└─────────────────────────────────────────┘
```

**Click the [Copy] button and that's your DATABASE_URL!**
