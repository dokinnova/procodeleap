import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.log('AuthProvider: No session found, redirecting to auth');
        navigate('/auth', { replace: true });
      } else {
        console.log('AuthProvider: Session found:', session);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', _event);
      
      if (_event === 'SIGNED_IN' && session) {
        console.log('AuthProvider: User signed in, redirecting to home');
        navigate('/', { replace: true });
      } else if (_event === 'SIGNED_OUT' || !session) {
        console.log('AuthProvider: No session, redirecting to auth');
        navigate('/auth', { replace: true });
        toast({
          title: "Sesión finalizada",
          description: "Por favor, inicia sesión para continuar.",
        });
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return <>{children}</>;
};