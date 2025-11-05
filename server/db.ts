import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();
const supabasePassword = process.env.SUPABASE_DB_PASSWORD?.trim();

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL must be set. Did you forget to add it to Vercel environment variables?",
  );
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    `SUPABASE_URL must be a valid HTTP/HTTPS URL. Got: ${supabaseUrl}`,
  );
}

if (!supabaseKey) {
  throw new Error(
    "SUPABASE_KEY must be set. Did you forget to add it to Vercel environment variables?",
  );
}

if (!supabasePassword) {
  throw new Error(
    "SUPABASE_DB_PASSWORD must be set. Did you forget to add it to Vercel environment variables?",
  );
}

// Create Supabase client (for auth, storage, and other Supabase features)
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Extract project reference from Supabase URL
// URL format: https://xxxxxxxxxxxxx.supabase.co
const projectRef = supabaseUrl.replace('https://', '').replace('http://', '').replace('.supabase.co', '');

// For Vercel/serverless environments, use Supabase's connection pooler
// If DATABASE_URL is not set, try the legacy PgBouncer format first (more compatible)
// Legacy format: postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres
// New format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres:${supabasePassword}@db.${projectRef}.supabase.co:6543/postgres`;

console.log('[DB] Connecting to database...');
console.log('[DB] Connection string format:', connectionString.replace(/:[^:@]+@/, ':****@'));

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1, // Use minimal connections for serverless
  idle_timeout: 20,
  connect_timeout: 30,
  onnotice: () => {}, // Suppress notices
});

export const db = drizzle(client, { schema });
