-- Add phone index to profiles for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Allow profiles to be created without auth.users reference (phone-only profiles)
ALTER TABLE profiles ALTER COLUMN id DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add unique constraint on phone
ALTER TABLE profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Update RLS to allow phone-based profile access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Anyone can view profiles (for order lookup by phone)
CREATE POLICY "Profiles are viewable by phone" ON profiles
  FOR SELECT USING (true);

-- Anyone can insert profiles (for guest checkout)
CREATE POLICY "Anyone can create profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Anyone can update profiles (for guest checkout)
CREATE POLICY "Anyone can update profiles" ON profiles
  FOR UPDATE USING (true);
