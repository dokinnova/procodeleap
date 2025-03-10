
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
    // Esta función maneja los parámetros de error en la URL
    const handleErrorParams = () => {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (error && errorDescription) {
        console.log("Error detectado en URL:", error, errorDescription);
        toast({
          title: "Error de autenticación",
          description: errorDescription.replace(/\+/g, ' '),
          variant: "destructive",
        });
        
        navigate('/auth', { replace: true });
        return true; // Indica que se encontró y manejó un error
      }
      return false; // No se encontró error
    };

    // Esta función maneja los flujos de recuperación de contraseña
    const handleRecoveryFlow = () => {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      // Detectamos si estamos en un flujo de recuperación basado en la URL
      const isRecoveryURL = 
        search.includes('type=recovery') || 
        search.includes('code=') ||
        search.includes('token=') ||
        pathname.includes('/auth/recovery') ||
        pathname.includes('/auth/callback') ||
        (hash && hash.includes('access_token='));
      
      if (isRecoveryURL) {
        console.log("Flujo de recuperación detectado en URL:", { pathname, search, hash });
        
        // Si no estamos ya en la página de reset-password, redirigimos allí
        if (!pathname.includes('/reset-password')) {
          console.log("Redirigiendo a reset-password con parámetros de URL");
          navigate(`/reset-password${search}${hash}`, { replace: true });
          return true; // Indica que se manejó un flujo de recuperación
        }
      }
      return false; // No se encontró o ya estamos en la página correcta
    };

    // Lógica principal del useEffect
    console.log("AuthProvider: URL actual:", window.location.href);
    
    // Primero verificamos si hay errores en la URL
    const errorHandled = handleErrorParams();
    if (errorHandled) return;
    
    // Luego verificamos si estamos en un flujo de recuperación
    const recoveryHandled = handleRecoveryFlow();
    if (recoveryHandled) return;
    
    // Si no hay errores ni flujos de recuperación, suscribirse a cambios de autenticación
    console.log("AuthProvider: Suscribiéndose a cambios de autenticación");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthProvider: Evento de autenticación:", event, session ? "Con sesión" : "Sin sesión");
      
      if (event === 'SIGNED_IN' && session) {
        if (location.pathname === '/auth') {
          console.log("AuthProvider: Usuario inició sesión, redirigiendo a inicio");
          navigate('/', { replace: true });
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("AuthProvider: Evento PASSWORD_RECOVERY, redirigiendo a reset-password");
        navigate('/reset-password', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthProvider: Usuario cerró sesión");
        if (location.pathname !== '/auth' && 
            !location.pathname.includes('/reset-password') &&
            !window.location.search.includes('type=recovery') &&
            !window.location.search.includes('code=')) {
          console.log("AuthProvider: Redirigiendo a /auth después de cerrar sesión");
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      console.log("AuthProvider: Limpiando suscripción");
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  return <>{children}</>;
};
