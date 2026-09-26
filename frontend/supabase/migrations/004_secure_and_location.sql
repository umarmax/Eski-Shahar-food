-- 004: Lock down customer PII + add delivery location fields
--
-- All reads/writes of orders and profiles now go through Edge Functions
-- (service role), so anon clients get no direct access to these tables.

-- ── Orders: remove public access ──
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- ── Profiles: remove public access ──
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ── Profiles: make upserts actually work ──
-- id referenced auth.users with no default, so every upsert from the
-- edge functions failed. Profiles are keyed by telegram_id / phone instead.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_key ON profiles(phone);

-- ── Orders: delivery location ──
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_accuracy REAL,
  ADD COLUMN IF NOT EXISTS location_source TEXT,
  ADD COLUMN IF NOT EXISTS location_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lang TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_lat_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_lat_check
  CHECK (delivery_lat IS NULL OR delivery_lat BETWEEN -90 AND 90);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_lng_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_lng_check
  CHECK (delivery_lng IS NULL OR delivery_lng BETWEEN -180 AND 180);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_location_source_check;
ALTER TABLE orders ADD CONSTRAINT orders_location_source_check
  CHECK (location_source IS NULL OR location_source IN ('app', 'bot'));

-- Used by the bot to find the order waiting for a chat location
CREATE INDEX IF NOT EXISTS idx_orders_location_pending
  ON orders(telegram_user_id, location_requested_at)
  WHERE delivery_lat IS NULL AND location_requested_at IS NOT NULL;
