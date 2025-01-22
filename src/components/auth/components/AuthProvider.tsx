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
      if (session) {
        console.log("User already logged in, redirecting to home");
        navigate('/');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && session) {
        console.log("Auth state changed - user logged in, redirecting to home");
        navigate('/');
      } else if (_event === 'USER_UPDATED') {
        console.log("Auth state changed - user updated");
      } else if (_event === 'SIGNED_OUT') {
        console.log("Auth state changed - user signed out");
      } else {
        console.log("Auth state changed:", _event);
        if (!session) {
          toast({
            title: "Error de autenticación",
            description: "Hubo un problema al autenticar. Por favor intenta de nuevo.",
            variant: "destructive",
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return <>{children}</>;
};