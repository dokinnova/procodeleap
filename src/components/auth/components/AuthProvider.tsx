
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const redirectingRef = useRef(false);

  useEffect(() => {
    console.log('AuthProvider: Initializing...', location.pathname);
    
    // Check if we already have an active session
    const checkExistingSession = async () => {
      try {
        if (!isMounted.current) return;
        
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error checking session:', error);
          if (isMounted.current) setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Session check result:', data?.session ? 'Session exists' : 'No session', 
                    'Current path:', location.pathname);
        
        if (data?.session) {
          console.log('AuthProvider: Existing session detected, user authenticated');
          
          if (location.pathname === '/auth' && !redirectingRef.current) {
            console.log('AuthProvider: On auth page with session, redirecting to home');
            redirectingRef.current = true;
            
            if (isMounted.current) {
              setTimeout(() => {
                if (isMounted.current) {
                  navigate('/', { replace: true });
                  redirectingRef.current = false;
                }
              }, 500);
            }
          }
        } else {
          console.log('AuthProvider: No session detected');
          if (location.pathname !== '/auth' && 
              location.pathname !== '/password-reset' && 
              !location.pathname.startsWith('/auth/callback') &&
              !redirectingRef.current) {
            console.log('AuthProvider: Not on auth page with no session, redirecting to auth');
            redirectingRef.current = true;
            
            if (isMounted.current) {
              setTimeout(() => {
                if (isMounted.current) {
                  navigate('/auth', { replace: true });
                  redirectingRef.current = false;
                }
              }, 500);
            }
          }
        }
        
        if (isMounted.current) setLoading(false);
      } catch (err) {
        console.error('AuthProvider: Unexpected error:', err);
        if (isMounted.current) setLoading(false);
      }
    };
    
    checkExistingSession();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', event, 'Session exists:', !!session, 
                  'Current path:', location.pathname);
      
      if (!isMounted.current) return;

      if (event === 'SIGNED_IN' && session && !redirectingRef.current) {
        console.log('AuthProvider: User authenticated, redirecting to home');
        toast("Bienvenido", {
          description: "Has iniciado sesión correctamente."
        });
        
        // Use setTimeout to allow the state to be updated before navigating
        redirectingRef.current = true;
        setTimeout(() => {
          if (isMounted.current) {
            navigate('/', { replace: true });
            redirectingRef.current = false;
          }
        }, 500);
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('AuthProvider: Password recovery event, redirecting to password reset');
        navigate('/password-reset');
      } else if (event === 'SIGNED_OUT' && !redirectingRef.current) {
        console.log('AuthProvider: User signed out');
        toast("Sesión cerrada", {
          description: "Has cerrado sesión correctamente."
        });
        redirectingRef.current = true;
        setTimeout(() => {
          if (isMounted.current) {
            navigate('/auth', { replace: true });
            redirectingRef.current = false;
          }
        }, 500);
      } else if (event === 'USER_UPDATED') {
        console.log('AuthProvider: User updated');
        toast("Perfil actualizado", {
          description: "Tu perfil ha sido actualizado correctamente."
        });
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [navigate, uiToast, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
