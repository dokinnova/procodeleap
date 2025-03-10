
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
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        // Clear previous session state
        if (isMounted) setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error checking session:', error);
          if (isMounted) {
            setSession(null);
            uiToast({
              title: "Authentication Error",
              description: "Please sign in again.",
              variant: "destructive",
            });
          }
        } else if (!data.session) {
          console.log('ProtectedRoute: No session found');
          if (isMounted) setSession(null);
        } else {
          console.log('ProtectedRoute: Session found:', data.session ? "Present" : "Not present");
          if (isMounted) setSession(data.session);
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        if (isMounted) {
          setSession(null);
          uiToast({
            title: "Unexpected Error",
            description: "An error occurred checking your session.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('ProtectedRoute: Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        toast("Session ended", {
          description: "You have been signed out.",
        });
        
        if (location.pathname !== '/auth' && 
            location.pathname !== '/password-reset' && 
            !location.pathname.startsWith('/auth/callback')) {
          navigate('/auth');
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/password-reset');
      } else if (event === 'USER_UPDATED') {
        toast("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
      } else if (event === 'SIGNED_IN') {
        toast("Session started", {
          description: "You have successfully signed in.",
        });
      }
      
      if (isMounted) setSession(newSession);
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, uiToast, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
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
