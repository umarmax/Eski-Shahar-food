-- 006: Delivery vs pickup, dish weight, customer reviews

-- ── Orders: delivery or pickup ──
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'delivery';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check
  CHECK (order_type IN ('delivery', 'pickup'));

-- ── Products: portion weight shown on menu cards ──
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS weight_grams INTEGER
  CHECK (weight_grams IS NULL OR weight_grams BETWEEN 0 AND 100000);

-- ── Reviews ──
-- Read and written only through the `reviews` Edge Function (no anon access,
-- so reviewer Telegram IDs never leave the server). Admins can hide a review
-- from the bot.
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  author_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT CHECK (text IS NULL OR char_length(text) <= 1000),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(telegram_user_id, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
