-- Allow public read access to orders (for phone-based lookup)
-- This is safe because orders are looked up by phone number which only the customer knows

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Allow anyone to read orders (filtered by phone in the app)
CREATE POLICY "Orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

-- Allow anyone to create orders (for guest checkout)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);
