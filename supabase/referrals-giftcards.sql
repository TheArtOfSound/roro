-- RoRo MODE — Referral Program & Gift Cards Schema
-- Run this in the Supabase SQL Editor after the main schema.sql

-- ============================================================
-- REFERRAL CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  credit_amount_cents INTEGER DEFAULT 10000, -- $100 default credit for referrer
  new_client_discount_cents INTEGER DEFAULT 5000, -- $50 default discount for new client
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REFERRAL REDEMPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES referral_codes(id),
  referred_client_id UUID REFERENCES clients(id),
  referrer_credit_applied BOOLEAN DEFAULT false,
  new_client_discount_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GIFT CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  balance_cents INTEGER NOT NULL,
  purchaser_name TEXT,
  purchaser_email TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  personal_message TEXT,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Admin: full access for authenticated users
CREATE POLICY "Admin full access" ON referral_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON referral_redemptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON gift_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public: anyone can check gift card balance by code
CREATE POLICY "Public can check gift cards" ON gift_cards FOR SELECT TO anon USING (true);

-- Public: anyone can insert a gift card (purchase flow)
CREATE POLICY "Public can purchase gift cards" ON gift_cards FOR INSERT TO anon WITH CHECK (true);
