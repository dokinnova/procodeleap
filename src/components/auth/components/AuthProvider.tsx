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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to auth");
        navigate('/auth', { replace: true });
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      
      if (_event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting to home");
        navigate('/', { replace: true });
      } else if (_event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        navigate('/auth', { replace: true });
      } else if (!session) {
        console.log("No session found, redirecting to auth");
        navigate('/auth', { replace: true });
        toast({
          title: "Sesión finalizada",
          description: "Tu sesión ha finalizado. Por favor, inicia sesión nuevamente.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return <>{children}</>;
};