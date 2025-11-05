import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();
const supabasePassword = process.env.SUPABASE_DB_PASSWORD?.trim();

if (!supabaseUrl || !supabaseKey || !supabasePassword) {
  throw new Error("Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_KEY, SUPABASE_DB_PASSWORD");
}

// Initialize Supabase client for storage and auth
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    autoRefreshToken: false, 
    persistSession: false 
  }
});

// Build connection string for Drizzle
// Extract project reference from Supabase URL
const projectRef = supabaseUrl
  .replace('https://', '')
  .replace('http://', '')
  .replace('.supabase.co', '');

// Use DATABASE_URL if provided, otherwise construct from Supabase credentials
// NOTE: Update YOUR_REGION with your actual Supabase region (e.g., ap-southeast-2, us-east-1, eu-west-1)
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.${projectRef}:${supabasePassword}@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`;

console.log('[DB] Connecting to:', connectionString.replace(/:[^:@]+@/, ':****@'));

// Create PostgreSQL client with connection pooling optimized for serverless
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 60, // Allow queries up to 60 seconds (for bcrypt operations)
  connect_timeout: 10,
  onnotice: () => {} // Suppress notices
});

export const db = drizzle(client, { schema });
