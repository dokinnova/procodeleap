
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLoading } from "./AuthLoading";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Comprobar si estamos en una ruta pública que no requiere redirección
  const isPublicRoute = 
    location.pathname === '/auth' || 
    location.pathname === '/password-reset' || 
    location.pathname.startsWith('/auth/callback');

  useEffect(() => {
    console.log('AuthProvider inicializando en ruta:', location.pathname);
    
    // Verificar sesión existente
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al verificar sesión:', error);
          setLoading(false);
          return;
        }
        
        // Actualizar estado de sesión
        setSession(data.session);
        
        // Lógica de redirección basada en sesión y ruta actual
        if (data.session) {
          console.log('Sesión detectada:', isPublicRoute ? 'En ruta pública' : 'En ruta protegida');
          
          // Si el usuario está autenticado y en una ruta pública como /auth, redireccionar a home
          if (location.pathname === '/auth') {
            console.log('Redirigiendo de /auth a home porque hay sesión');
            window.location.href = '/';
          }
        } else if (!isPublicRoute) {
          // Si no hay sesión y estamos en una ruta protegida, redireccionar a /auth
          console.log('No hay sesión y estamos en ruta protegida, redirigiendo a /auth');
          navigate('/auth', { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error inesperado:', error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Cambio en estado de autenticación:', event, 'Sesión:', newSession ? 'Existe' : 'No existe');
      
      // Actualizar el estado de sesión
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession) {
        console.log('Usuario ha iniciado sesión');
        toast.success("Bienvenido", {
          description: "Has iniciado sesión correctamente"
        });
        
        // Usar window.location para forzar una redirección completa
        if (location.pathname === '/auth') {
          window.location.href = '/';
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuario ha cerrado sesión');
        toast.success("Sesión cerrada", {
          description: "Has cerrado sesión correctamente"
        });
        navigate('/auth', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Recuperación de contraseña');
        navigate('/password-reset');
      } else if (event === 'USER_UPDATED') {
        console.log('Usuario actualizado');
        toast.success("Perfil actualizado", {
          description: "Tu perfil ha sido actualizado correctamente"
        });
      }
    });
    
    return () => {
      console.log('Limpiando suscripción de AuthProvider');
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, isPublicRoute]);

  // Mostrar indicador de carga mientras se verifica la sesión
  if (loading) {
    return <AuthLoading />;
  }

  return <>{children}</>;
};
