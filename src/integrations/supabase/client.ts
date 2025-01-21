import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upmokuswronpozhhopts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NjQ1NzAsImV4cCI6MjAyNTI0MDU3MH0.vHxjwGKN2TaFnQZVgBqr5RKvEGQXHzGhOZ_cBhNGVwE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});