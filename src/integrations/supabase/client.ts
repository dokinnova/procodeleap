import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://upmokuswronpozhhopts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY2NDQ1NzAsImV4cCI6MjAyMjIyMDU3MH0.GG5UNsOVWeIoGdgV9P7uZA-x9yqQF0h7AxQPcUKNe-s';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'sb-upmokuswronpozhhopts-auth-token',
  },
});