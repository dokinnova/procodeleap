
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
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
        
        if (data?.session) {
          console.log('AuthProvider: Existing session detected, redirecting to home');
          navigate('/', { replace: true });
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
      console.log('AuthProvider: Auth state change:', event);
      
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
      subscription.unsubscribe();
    };
  }, [navigate, uiToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
