-- RoRo MODE — Admin Settings, Services, Promos, Tasks
-- Run this in the Supabase SQL Editor

-- Services table (replaces hardcoded SERVICES array)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_display TEXT NOT NULL,
  icon TEXT DEFAULT '◎',
  image TEXT,
  keywords TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percent', 'flat')) NOT NULL,
  discount_value INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 100,
  uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks for AI assistant / follow-ups
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'follow_up',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active services" ON services FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admin full access" ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial services from current hardcoded data
INSERT INTO services (title, description, price_display, icon, image, keywords, sort_order) VALUES
('Home Resets', 'A complete refresh of your living spaces — reimagined layouts, curated styling, and intentional design that transforms your home into something that feels entirely new... without buying brand new.', 'Starting at $375', '⟐', 'service-resets.png', ARRAY['Decluttering', 'Space Planning', 'Room Styling', 'Fresh Start'], 1),
('Closet Transformations', 'From chaotic to composed — thoughtfully designed systems tailored to your life. Organized by season, color, and frequency so your mornings begin with ease and intention.', 'Starting at $250', '◧', 'service-closets.png', ARRAY['Wardrobe Edit', 'Capsule Closet', 'Color Coded', 'Storage Solutions'], 2),
('Pantry Organization', 'Functional beauty at the heart of your kitchen — clear containers, intentional zones, and systems designed to be lived in and maintained with ease.', 'Starting at $200', '⊞', 'service-pantry.png', ARRAY['Container Systems', 'Labeled Zones', 'Basket Styling', 'Functional Design'], 3),
('Sustainable Styling', 'Treasure hunting at its finest — sourcing thrifted, vintage, and secondhand pieces that bring depth, character, and individuality no catalog can replicate.', 'Starting at $150', '◎', 'service-styling.png', ARRAY['Thrift Sourcing', 'Vintage Finds', 'Eco-Friendly', 'One-of-a-Kind'], 4),
('Virtual Consultation', 'Step into a personalized design experience from anywhere — expert guidance on organization, styling, and functional flow, tailored specifically to your lifestyle.', '$125 / session', '◉', 'service-virtual.png', ARRAY['Remote Design', 'Video Session', 'Personalized Plan', 'Anywhere'], 5);
