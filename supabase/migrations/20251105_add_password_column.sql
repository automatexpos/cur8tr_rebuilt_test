-- Add password column to users table
-- Run this migration if you already have the database set up

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR;

-- Make email NOT NULL if it isn't already
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
