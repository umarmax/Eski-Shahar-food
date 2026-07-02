-- Add phone index to profiles for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Update RLS to allow phone-based profile access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Anyone can view profiles (for order lookup by phone)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Anyone can insert profiles (for guest checkout)
CREATE POLICY "Anyone can create profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Anyone can update profiles (for guest checkout)
CREATE POLICY "Anyone can update profiles" ON profiles
  FOR UPDATE USING (true);
