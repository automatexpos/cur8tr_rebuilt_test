import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Check for required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error(
    "SUPABASE_URL must be set. Did you forget to add it to .env?",
  );
}

if (!process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_KEY must be set. Did you forget to add it to .env?",
  );
}

if (!process.env.SUPABASE_DB_PASSWORD) {
  throw new Error(
    "SUPABASE_DB_PASSWORD must be set. Did you forget to add it to .env?",
  );
}

// Create Supabase client (for auth, storage, and other Supabase features)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Extract project reference from Supabase URL
// URL format: https://xxxxxxxxxxxxx.supabase.co
const projectRef = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// For Vercel/serverless environments, use Supabase's connection pooler (Supavisor)
// Pooler format: postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
// Direct DB format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1, // Use minimal connections for serverless
  idle_timeout: 20,
  connect_timeout: 30,
});

export const db = drizzle(client, { schema });
