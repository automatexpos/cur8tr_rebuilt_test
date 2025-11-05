-- CUR8tr Database Migration for Supabase
-- Created: 2025-11-05
-- This migration creates all necessary tables, indexes, and constraints

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== SESSION STORAGE TABLE (for express-session) =====
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  username VARCHAR UNIQUE,
  bio TEXT,
  instagram_url VARCHAR,
  tiktok_url VARCHAR,
  youtube_url VARCHAR,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== CATEGORIES TABLE =====
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(100) NOT NULL,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_category UNIQUE (name, user_id)
);

-- ===== RECOMMENDATIONS TABLE =====
CREATE TABLE IF NOT EXISTS recommendations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER NOT NULL,
  pro_tip VARCHAR(500),
  category_id VARCHAR REFERENCES categories(id),
  location VARCHAR(500),
  latitude REAL,
  longitude REAL,
  external_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON recommendations(created_at);

-- ===== TAGS TABLE =====
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== RECOMMENDATION_TAGS (Join Table) =====
CREATE TABLE IF NOT EXISTS recommendation_tags (
  recommendation_id VARCHAR NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  tag_id VARCHAR NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rec_tags_rec ON recommendation_tags(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rec_tags_tag ON recommendation_tags(tag_id);

-- ===== FOLLOWS TABLE =====
CREATE TABLE IF NOT EXISTS follows (
  follower_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT follows_pk UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- ===== LIKES TABLE =====
CREATE TABLE IF NOT EXISTS likes (
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id VARCHAR NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT likes_pk UNIQUE (user_id, recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_rec ON likes(recommendation_id);

-- ===== CURATOR_RECS (Admin-curated recommendations) =====
CREATE TABLE IF NOT EXISTS curator_recs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recommendation_id VARCHAR NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  curated_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curator_recs_rec ON curator_recs(recommendation_id);

-- ===== SECTIONS TABLE (for organizing CUR8tr Recs page) =====
CREATE TABLE IF NOT EXISTS sections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(display_order);

-- ===== ADMIN RECOMMENDS TABLE (CUR8tr Recommends - Admin-curated featured cards) =====
CREATE TABLE IF NOT EXISTS admin_recommends (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  image_url TEXT NOT NULL,
  external_url TEXT NOT NULL,
  price VARCHAR(50),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  section_id VARCHAR REFERENCES sections(id) ON DELETE SET NULL,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_recommends_visible ON admin_recommends(is_visible);
CREATE INDEX IF NOT EXISTS idx_admin_recommends_created ON admin_recommends(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_recommends_section ON admin_recommends(section_id);

-- ===== COMMENTS TABLE =====
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id VARCHAR NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  parent_id VARCHAR REFERENCES comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_recommendation ON comments(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- ===== SECTION RECOMMENDATIONS (mapping table) =====
CREATE TABLE IF NOT EXISTS section_recommendations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_id VARCHAR NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  recommendation_id VARCHAR NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_section_rec UNIQUE (section_id, recommendation_id)
);

CREATE INDEX IF NOT EXISTS idx_section_recs_section ON section_recommendations(section_id);
CREATE INDEX IF NOT EXISTS idx_section_recs_order ON section_recommendations(section_id, display_order);

-- ===== APP SETTINGS TABLE =====
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== ROW LEVEL SECURITY (RLS) POLICIES =====
-- Enable RLS on all tables except sessions
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE curator_recs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_recommends ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- For now, create permissive policies to allow all operations
-- You can refine these later based on your security requirements

-- Users: Anyone can read, users can update their own profile
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Categories: Anyone can read, authenticated users can create
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create categories" ON categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid()::text = user_id);

-- Recommendations: Anyone can read, users can manage their own
CREATE POLICY "Recommendations are viewable by everyone" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Users can create recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own recommendations" ON recommendations FOR DELETE USING (auth.uid()::text = user_id);

-- Tags: Anyone can read, authenticated users can create
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Recommendation Tags: Anyone can read, users can manage their recommendation's tags
CREATE POLICY "Recommendation tags are viewable by everyone" ON recommendation_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage their recommendation tags" ON recommendation_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM recommendations WHERE id = recommendation_id AND user_id = auth.uid()::text)
);

-- Follows: Anyone can read, users can manage their own follows
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid()::text = follower_id);

-- Likes: Anyone can read, users can manage their own likes
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like recommendations" ON likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can unlike recommendations" ON likes FOR DELETE USING (auth.uid()::text = user_id);

-- Curator Recs: Anyone can read, admins can manage
CREATE POLICY "Curator recs are viewable by everyone" ON curator_recs FOR SELECT USING (true);
CREATE POLICY "Admins can manage curator recs" ON curator_recs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true)
);

-- Admin Recommends: Anyone can read, admins can manage
CREATE POLICY "Admin recommends are viewable by everyone" ON admin_recommends FOR SELECT USING (true);
CREATE POLICY "Admins can manage admin recommends" ON admin_recommends FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true)
);

-- Comments: Anyone can read, users can manage their own
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id);

-- Sections: Anyone can read, admins can manage
CREATE POLICY "Sections are viewable by everyone" ON sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage sections" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true)
);

-- Section Recommendations: Anyone can read, admins can manage
CREATE POLICY "Section recommendations are viewable by everyone" ON section_recommendations FOR SELECT USING (true);
CREATE POLICY "Admins can manage section recommendations" ON section_recommendations FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true)
);

-- App Settings: Anyone can read, admins can manage
CREATE POLICY "App settings are viewable by everyone" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app settings" ON app_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true)
);

-- ===== FUNCTIONS AND TRIGGERS FOR AUTO-UPDATING TIMESTAMPS =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_recommends_updated_at BEFORE UPDATE ON admin_recommends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
