
import { useEffect, useState } from "react";
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

  useEffect(() => {
    console.log('ProtectedRoute: Checking session...');
    let mounted = true;
    
    const checkSession = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error checking session:', error);
          if (mounted) {
            setSession(null);
            setLoading(false);
            if (location.pathname !== '/auth') {
              navigate('/auth', { replace: true });
            }
          }
          return;
        }
        
        if (!data.session) {
          console.log('ProtectedRoute: No session found');
          if (mounted) {
            setSession(null);
            setLoading(false);
            if (location.pathname !== '/auth') {
              navigate('/auth', { replace: true });
            }
          }
          return;
        }
        
        console.log('ProtectedRoute: Session found');
        if (mounted) {
          setSession(data.session);
          setLoading(false);
          if (location.pathname === '/auth') {
            navigate('/', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        if (mounted) {
          setSession(null);
          setLoading(false);
          if (location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('ProtectedRoute: Auth state change:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        toast("Session ended", {
          description: "You have been signed out.",
        });
        
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          navigate('/auth', { replace: true });
        }
      } else if (event === 'SIGNED_IN') {
        setSession(newSession);
        if (location.pathname === '/auth') {
          navigate('/', { replace: true });
        }
      }
      
      if (mounted) setSession(newSession);
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up subscription');
      mounted = false;
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
            <p className="text-gray-600">Sign in to continue</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
