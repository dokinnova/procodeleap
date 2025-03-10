
import { useEffect } from "react";
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

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    // Verificar si ya tenemos una sesión activa
    const checkExistingSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('AuthProvider: Error al verificar sesión:', error);
      } else if (session) {
        console.log('AuthProvider: Sesión existente detectada, redirigiendo al inicio');
        navigate('/', { replace: true });
      }
    };
    
    checkExistingSession();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Cambio en estado de autenticación:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider: Usuario autenticado, redirigiendo al inicio');
        toast("Bienvenido/a", {
          description: "Has iniciado sesión correctamente."
        });
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/password-reset');
      }
    });

    return () => {
      console.log('AuthProvider: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, [navigate, uiToast]);

  return <>{children}</>;
};
