-- RLS Policies for Client Portal
-- Clients can only access their own data based on their auth email matching the clients table

-- Enable RLS on tables (safe to run even if already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Clients can view their own bookings
-- (client's auth email must match the email in the clients table linked via client_id)
CREATE POLICY "Clients can view own bookings"
  ON bookings
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Clients can view their own invoices
CREATE POLICY "Clients can view own invoices"
  ON invoices
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Clients can view messages where their email matches
CREATE POLICY "Clients can view own messages"
  ON messages
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
  );

-- Clients can insert new messages (for sending messages from the portal)
CREATE POLICY "Clients can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    email = auth.jwt() ->> 'email'
  );

-- Clients can view their own client record
CREATE POLICY "Clients can view own client record"
  ON clients
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
  );
