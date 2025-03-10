
import { useEffect, useState } from "react";
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

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    let mounted = true;
    
    // Check if we already have an active session
    const checkExistingSession = async () => {
      try {
        if (!mounted) return;
        
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error checking session:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (data?.session && location.pathname === '/auth') {
          console.log('AuthProvider: Existing session detected, redirecting to home');
          navigate('/', { replace: true });
        }
        
        if (mounted) setLoading(false);
      } catch (err) {
        console.error('AuthProvider: Unexpected error:', err);
        if (mounted) setLoading(false);
      }
    };
    
    checkExistingSession();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider: User authenticated, redirecting to home');
        toast("Welcome", {
          description: "You have successfully signed in."
        });
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('AuthProvider: Password recovery event, redirecting to password reset');
        navigate('/password-reset');
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: User signed out');
        toast("Signed out", {
          description: "You have been signed out."
        });
        navigate('/auth', { replace: true });
      } else if (event === 'USER_UPDATED') {
        console.log('AuthProvider: User updated');
        toast("Profile updated", {
          description: "Your profile has been updated successfully."
        });
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
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

  return <>{children}</>;
};
