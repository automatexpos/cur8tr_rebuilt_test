# Supabase Migration Guide

## Overview
This project has been migrated from Neon to Supabase PostgreSQL database.

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** (gear icon in sidebar)
3. Click on **API** in the left menu
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **Project API keys** → `anon` `public` key (for most use cases)
   - Or **Project API keys** → `service_role` key (for admin/server-side operations)
5. Get your **Database Password**:
   - Go to **Settings** → **Database**
   - If you don't remember your password, you can reset it here

### 2. Update Environment Variables

Open the `.env` file in the root directory and add these values:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your_anon_or_service_role_key
SUPABASE_DB_PASSWORD=your_database_password
```

**Note:** 
- Use the `anon` key for general use
- Use the `service_role` key if you need bypass Row Level Security (for admin operations)

### 3. Run the Migration SQL

You have two options to create the database schema:

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `supabase/migrations/20251105_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

#### Option B: Using Drizzle Push (Alternative)

If you prefer to use Drizzle ORM to push the schema:

```powershell
npm run db:push
```

**Note:** The SQL file includes Row Level Security (RLS) policies. If you use Drizzle push, you may need to manually set up RLS policies in Supabase.

### 4. Verify the Migration

After running the migration, verify that all tables were created:

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - sessions
   - users
   - categories
   - recommendations
   - tags
   - recommendation_tags
   - follows
   - likes
   - curator_recs
   - admin_recommends
   - comments
   - sections
   - section_recommendations
   - app_settings

### 5. Start the Development Server

```powershell
npm run dev
```

The server will now connect to your Supabase database!

## What Changed?

### Dependencies
- Removed: `@neondatabase/serverless`
- Added: `pg` (standard PostgreSQL client)
- Added: `@types/pg` (TypeScript types)

### Configuration Files
- **server/db.ts**: Updated to use `pg` instead of Neon's serverless client
- **drizzle.config.ts**: Updated SSL configuration for Supabase
- **.env**: Updated with Supabase connection string format

### Database Features
- All tables, indexes, and constraints from the original schema
- Row Level Security (RLS) policies for secure data access
- Automatic timestamp updates via triggers
- UUID generation using PostgreSQL's `gen_random_uuid()`

## Supabase Features You Can Use

With Supabase, you now have access to:
- **Real-time subscriptions** to database changes
- **Built-in authentication** (if you want to replace custom auth)
- **Storage** for file uploads
- **Edge Functions** for serverless functions
- **Auto-generated REST API**
- **Auto-generated GraphQL API**

## Row Level Security (RLS)

The migration includes RLS policies that:
- Allow public read access to most tables
- Restrict write operations to authenticated users
- Limit admin operations to users with `is_admin = true`
- Allow users to manage their own data

You can customize these policies in the Supabase dashboard under **Authentication > Policies**.

## Troubleshooting

### Connection Issues
If you get connection errors:
1. Make sure you're using the **Session** mode connection string (port 6543)
2. Verify your database password is correct
3. Check that SSL is enabled in your connection

### Migration Errors
If tables already exist:
- The SQL uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- To start fresh, you can drop all tables in Supabase SQL Editor and re-run

### RLS Policy Issues
If you're getting permission denied errors:
- Check your RLS policies in Supabase dashboard
- You may need to temporarily disable RLS during development
- Make sure you're authenticating properly with Supabase auth

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/get-started-postgresql)
