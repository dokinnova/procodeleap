
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...', location.pathname);
    
    // Check if we already have an active session
    const checkExistingSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error checking session:', error);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Session check result:', data?.session ? 'Session exists' : 'No session', 
                    'Current path:', location.pathname);
        
        if (data?.session) {
          console.log('AuthProvider: Existing session detected, user authenticated');
          
          // Only redirect if we're on the auth page to prevent unnecessary redirects
          if (location.pathname === '/auth') {
            console.log('AuthProvider: On auth page with session, redirecting to home');
            navigate('/', { replace: true });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('AuthProvider: Unexpected error:', err);
        setLoading(false);
      }
    };
    
    checkExistingSession();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', event, 'Session exists:', !!session, 
                  'Current path:', location.pathname);

      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider: User authenticated, redirecting to home');
        toast("Bienvenido", {
          description: "Has iniciado sesión correctamente."
        });
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('AuthProvider: Password recovery event, redirecting to password reset');
        navigate('/password-reset');
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: User signed out');
        toast("Sesión cerrada", {
          description: "Has cerrado sesión correctamente."
        });
        navigate('/auth', { replace: true });
      } else if (event === 'USER_UPDATED') {
        console.log('AuthProvider: User updated');
        toast("Perfil actualizado", {
          description: "Tu perfil ha sido actualizado correctamente."
        });
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
