
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://upmokuswronpozhhopts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbW9rdXN3cm9ucG96aGhvcHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzE4NjAsImV4cCI6MjA0OTYwNzg2MH0.BYsAMMi8nf_TzQ5cPEfKeJhbYIfyg-36_kVrWLhLrhY';

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

// Establecer el gestor de eventos para cambios en la URL
// Esto ayuda con los flujos de autenticación como restablecimiento de contraseña
window.addEventListener('hashchange', () => {
  supabase.auth.getSession();
});

