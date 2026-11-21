import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UOAGrwzLocp-oNp6LOiwyA_1_Cz5uOz';

export const isLiveSupabaseConfigured = Boolean(
  (process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co') && 
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UOAGrwzLocp-oNp6LOiwyA_1_Cz5uOz') &&
  !(process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co').includes('demo-edzy-school')
);

/**
 * Supabase client instance with automatic offline / demo resilience.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
