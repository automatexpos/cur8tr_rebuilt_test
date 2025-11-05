# Quick Setup Guide for Supabase

## Step 1: Get Your Credentials

From your Supabase Dashboard:

1. **Project URL**: Settings → API → Project URL
   - Example: `https://abcdefghijklmno.supabase.co`

2. **API Key**: Settings → API → Project API keys
   - Use `anon public` key for general use
   - Use `service_role` key for admin operations (bypasses RLS)

3. **Database Password**: Settings → Database
   - This is the password you set when creating the project
   - Can be reset if forgotten

4. **Region** (optional): Settings → General → Region
   - Example: `us-east-1`, `eu-west-1`, etc.
   - Used for database pooler connection

## Step 2: Update .env File

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_anon_or_service_role_key_here
SUPABASE_DB_PASSWORD=your_database_password
```

**Note:** If your pooler is not in `us-east-1`, update the region in:
- `server/db.ts` (line with `aws-0-us-east-1.pooler.supabase.com`)
- `drizzle.config.ts` (line with `aws-0-us-east-1.pooler.supabase.com`)

Replace `us-east-1` with your region (e.g., `eu-west-1`, `ap-southeast-1`, etc.)

## Step 3: Run Migration SQL

1. Go to Supabase Dashboard
2. Click **SQL Editor** in sidebar
3. Click **New query**
4. Copy & paste contents from: `supabase/migrations/20251105_initial_schema.sql`
5. Click **Run** (or Ctrl+Enter)

## Step 4: Start Development Server

```powershell
npm run dev
```

Your server should now connect to Supabase! 🚀

## Troubleshooting

### Error: "connection refused" or timeout
- Check if your region is correct in `server/db.ts` and `drizzle.config.ts`
- Verify your database password is correct
- Make sure IPv6 is enabled (or use IPv4 pooler if needed)

### Error: "password authentication failed"
- Reset your database password in Supabase Settings → Database
- Update `SUPABASE_DB_PASSWORD` in `.env`

### Error: "permission denied"
- You may need to use the `service_role` key instead of `anon` key
- Update `SUPABASE_KEY` in `.env` with the service role key
