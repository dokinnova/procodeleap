
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthRedirect: Checking session...', location.pathname);
    
    const checkSession = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuthRedirect: Error checking session:', error);
          setSession(null);
          setLoading(false);
          return;
        }
        
        console.log('useAuthRedirect: Session check result:', data?.session ? 'Session exists' : 'No session');
        
        if (!data.session) {
          console.log('useAuthRedirect: No session found');
          setSession(null);
          if (location.pathname !== '/auth' && 
              location.pathname !== '/password-reset' && 
              !location.pathname.startsWith('/auth/callback')) {
            console.log('useAuthRedirect: No session - Redirecting to auth page');
            navigate('/auth', { replace: true });
          }
        } else {
          console.log('useAuthRedirect: Session found', location.pathname);
          setSession(data.session);
          if (location.pathname === '/auth') {
            console.log('useAuthRedirect: On auth page with session - Redirecting to home');
            navigate('/', { replace: true });
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('useAuthRedirect: Error:', error);
        setSession(null);
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('useAuthRedirect: Auth state change:', event, 'Session exists:', !!newSession);

      if (event === 'SIGNED_IN' && newSession) {
        console.log('useAuthRedirect: User signed in, setting session and redirecting if on auth page');
        setSession(newSession);
        if (location.pathname === '/auth') {
          console.log('useAuthRedirect: SIGNED_IN - Redirecting to home from auth page');
          navigate('/', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('useAuthRedirect: User signed out');
        setSession(null);
        toast("Sesión terminada", {
          description: "Has cerrado sesión.",
        });
        
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          console.log('useAuthRedirect: SIGNED_OUT - Redirecting to auth page');
          navigate('/auth', { replace: true });
        }
      } else if (newSession) {
        console.log('useAuthRedirect: Setting session from auth state change');
        setSession(newSession);
      } else if (!newSession && event !== 'INITIAL_SESSION') {
        console.log('useAuthRedirect: No session after auth state change');
        setSession(null);
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          console.log('useAuthRedirect: No session after auth state change - Redirecting to auth');
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      console.log('useAuthRedirect: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { session, loading };
};
