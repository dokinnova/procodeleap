
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

// Add improved debugging for auth events
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth event: ${event}`, session ? "Session exists" : "No session");
  
  // Log detailed session info for debugging
  if (session) {
    console.log("Session user:", session.user.email);
    console.log("Token expiry:", new Date(session.expires_at! * 1000).toLocaleString());
  }
  
  if (event === 'PASSWORD_RECOVERY') {
    // Force reload the page when a PASSWORD_RECOVERY event is detected
    // This ensures the recovery flow is properly initialized
    if (window.location.pathname !== '/reset-password') {
      window.location.href = '/reset-password';
    }
  }
});

// Handle URL changes to ensure auth session is processed
window.addEventListener('hashchange', () => {
  console.log('Hash changed, processing auth session');
  supabase.auth.getSession();
});

window.addEventListener('popstate', () => {
  console.log('URL changed, processing auth session');
  supabase.auth.getSession();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, processing auth session');
  
  // If there's a code parameter in the URL, force processing it
  if (window.location.search.includes('code=')) {
    console.log('Auth code detected in URL, processing session exchange');
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error exchanging code for session:', error);
        } else {
          console.log('Successfully exchanged code for session', data);
        }
      });
  } else {
    supabase.auth.getSession();
  }
});
