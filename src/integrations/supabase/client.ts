import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://upmokuswronpozhhopts.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzE4NjAsImV4cCI6MjA0OTYwNzg2MH0.BYsAMMi8nf_TzQ5cPEfKeJhbYIfyg-36_kVrWLhLrhY";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // Changed back to true to maintain session
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: sessionStorage // Keep using sessionStorage for incognito compatibility
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
    },
    db: {
      schema: 'public'
    }
  }
);