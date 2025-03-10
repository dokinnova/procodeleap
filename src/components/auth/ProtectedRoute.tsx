
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./AuthForm";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();
  const isMounted = useRef(true);

  useEffect(() => {
    console.log('ProtectedRoute: Checking session...', location.pathname);
    
    const checkSession = async () => {
      try {
        if (!isMounted.current) return;
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error checking session:', error);
          if (isMounted.current) {
            setSession(null);
            setLoading(false);
            if (location.pathname !== '/auth' && 
                location.pathname !== '/password-reset' && 
                !location.pathname.startsWith('/auth/callback')) {
              console.log('ProtectedRoute: Error case - Redirecting to auth page');
              navigate('/auth', { replace: true });
            }
          }
          return;
        }
        
        console.log('ProtectedRoute: Session check result:', data?.session ? 'Session exists' : 'No session');
        
        if (!data.session) {
          console.log('ProtectedRoute: No session found');
          if (isMounted.current) {
            setSession(null);
            setLoading(false);
            if (location.pathname !== '/auth' && 
                location.pathname !== '/password-reset' && 
                !location.pathname.startsWith('/auth/callback')) {
              console.log('ProtectedRoute: No session - Redirecting to auth page');
              navigate('/auth', { replace: true });
            }
          }
          return;
        }
        
        console.log('ProtectedRoute: Session found', location.pathname);
        if (isMounted.current) {
          setSession(data.session);
          setLoading(false);
          if (location.pathname === '/auth') {
            console.log('ProtectedRoute: On auth page with session - Redirecting to home');
            setTimeout(() => {
              if (isMounted.current) {
                navigate('/', { replace: true });
              }
            }, 100);
          }
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        if (isMounted.current) {
          setSession(null);
          setLoading(false);
          if (location.pathname !== '/auth' && 
              location.pathname !== '/password-reset' && 
              !location.pathname.startsWith('/auth/callback')) {
            console.log('ProtectedRoute: Error case - Redirecting to auth page');
            navigate('/auth', { replace: true });
          }
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('ProtectedRoute: Auth state change:', event, 'Session exists:', !!newSession);
      
      if (!isMounted.current) return;

      if (event === 'SIGNED_IN' && newSession) {
        console.log('ProtectedRoute: User signed in, setting session and redirecting if on auth page');
        setSession(newSession);
        if (location.pathname === '/auth') {
          console.log('ProtectedRoute: SIGNED_IN - Redirecting to home from auth page');
          setTimeout(() => {
            if (isMounted.current) {
              navigate('/', { replace: true });
            }
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('ProtectedRoute: User signed out');
        setSession(null);
        toast("Sesión terminada", {
          description: "Has cerrado sesión.",
        });
        
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          console.log('ProtectedRoute: SIGNED_OUT - Redirecting to auth page');
          navigate('/auth', { replace: true });
        }
      } else if (newSession) {
        console.log('ProtectedRoute: Setting session from auth state change');
        setSession(newSession);
      } else if (!newSession && event !== 'INITIAL_SESSION') {
        console.log('ProtectedRoute: No session after auth state change');
        setSession(null);
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          console.log('ProtectedRoute: No session after auth state change - Redirecting to auth');
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up subscription');
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

  if (!session && location.pathname !== '/auth') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-4">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">COPRODELI</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
