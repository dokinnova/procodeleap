
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    // Verificar si estamos en la página de auth y hay un error en la URL
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error && errorDescription) {
      console.log('AuthProvider: Error detectado en URL:', error, errorDescription);
      toast({
        title: "Error de autenticación",
        description: errorDescription.replace(/\+/g, ' '),
        variant: "destructive",
      });
      
      // Limpiar los parámetros de error de la URL
      navigate('/auth', { replace: true });
      return;
    }
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Cambio de estado de auth:', event);
      
      // Solo mostrar mensaje y redirigir si el usuario inicia sesión manualmente
      // No mostrar mensajes en la carga inicial de la página de auth
      if (event === 'SIGNED_IN' && session && location.pathname !== '/auth') {
        console.log('AuthProvider: Usuario conectado, redireccionando a inicio');
        toast({
          title: "Sesión iniciada",
          description: "Has iniciado sesión correctamente",
        });
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('AuthProvider: Recuperación de contraseña iniciada');
        navigate('/auth', { replace: true });
        toast({
          title: "Recuperación de contraseña",
          description: "Por favor, sigue las instrucciones para restablecer tu contraseña",
        });
      }
    });

    return () => {
      console.log('AuthProvider: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  return <>{children}</>;
};
