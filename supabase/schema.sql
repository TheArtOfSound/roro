-- RoRo MODE Database Schema
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  address     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TYPE booking_status AS ENUM (
  'pending', 'accepted', 'declined', 'scheduled', 'in_progress', 'completed', 'cancelled'
);

CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  service       TEXT NOT NULL,
  status        booking_status DEFAULT 'pending',
  scheduled_at  TIMESTAMPTZ,
  duration_hrs  NUMERIC(4,1),
  location      TEXT,
  notes         TEXT,
  price_cents   INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TYPE invoice_status AS ENUM (
  'draft', 'sent', 'paid', 'overdue', 'cancelled'
);

CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number    TEXT UNIQUE NOT NULL,
  client_id         UUID REFERENCES clients(id) ON DELETE SET NULL,
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL,
  status            invoice_status DEFAULT 'draft',
  amount_cents      INTEGER NOT NULL,
  description       TEXT,
  line_items        JSONB DEFAULT '[]',
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  stripe_payment_id TEXT,
  stripe_payment_url TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTACT MESSAGES (public form submissions)
-- ============================================================
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  service     TEXT,
  message     TEXT,
  is_read     BOOLEAN DEFAULT false,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin: full access for authenticated users
CREATE POLICY "Admin full access" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON messages FOR ALL USING (auth.role() = 'authenticated');

-- Public: anyone can submit contact form messages
CREATE POLICY "Public can submit messages" ON messages FOR INSERT WITH CHECK (true);
