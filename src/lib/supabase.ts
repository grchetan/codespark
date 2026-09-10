import { createClient } from '@supabase/supabase-js';

// SECURITY: These values MUST be set as Vite environment variables.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are the ONLY Supabase credentials
// that should ever appear in frontend code. They are intentionally public/publishable keys.
// NEVER put the Supabase service_role key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
