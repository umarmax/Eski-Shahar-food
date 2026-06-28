import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icjrhufmtqedmihjogco.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-3Q-Qn2C33twoV_MZJSWMA_LyqE1Lho'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
