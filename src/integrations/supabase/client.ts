import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://upmokuswronpozhhopts.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NTI4NjAsImV4cCI6MjAyMTQyODg2MH0.qKtfNHhL8Hs_8Dr19NMsKKO1nJ7MCyJi6eM7kYd8l5M";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
  }
);