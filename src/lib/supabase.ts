import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvrrscotkreonhrgxodn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cnJzY290a3Jlb25ocmd4b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTI3OTQsImV4cCI6MjEwMzQ4ODc5NH0.Oh9qqOdNpTM8QfQSF9MHPjG61gffjh0-Qs0kSYSctS4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
