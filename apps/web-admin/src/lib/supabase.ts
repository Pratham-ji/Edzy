import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UOAGrwzLocp-oNp6LOiwyA_1_Cz5uOz';

export const isLiveSupabaseConfigured = Boolean(
  (import.meta.env.VITE_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co') &&
  (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UOAGrwzLocp-oNp6LOiwyA_1_Cz5uOz') &&
  !(import.meta.env.VITE_SUPABASE_URL || 'https://oxxoswftsibegawhshjv.supabase.co').includes('demo-edzy-school')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
