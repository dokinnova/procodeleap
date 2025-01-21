import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://upmokuswronpozhhopts.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzE4NjAsImV4cCI6MjA0OTYwNzg2MH0.BYsAMMi8nf_TzQ5cPEfKeJhbYIfyg-36_kVrWLhLrhY";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);