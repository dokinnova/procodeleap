
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ProtectedRoute: Verificando sesión...');
    
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error al verificar sesión:', error);
          setSession(null);
          
          // Solo mostrar error si no estamos en la página de autenticación
          if (isProtectedRoute() && !location.pathname.startsWith('/auth')) {
            toast({
              title: "Error de autenticación",
              description: "Por favor, inicia sesión de nuevo.",
              variant: "destructive",
            });
            
            if (isProtectedRoute()) {
              console.log('ProtectedRoute: Redirigiendo a /auth debido a error de sesión');
              setTimeout(() => navigate('/auth', { replace: true }), 0);
            }
          }
        } else if (!currentSession) {
          console.log('ProtectedRoute: No se encontró sesión');
          setSession(null);
          
          // Solo redirigir si la ruta requiere autenticación y no estamos ya en la página de auth
          if (isProtectedRoute() && !location.pathname.startsWith('/auth')) {
            console.log('ProtectedRoute: Redirigiendo a /auth porque no hay sesión');
            setTimeout(() => navigate('/auth', { replace: true }), 0);
          }
        } else {
          console.log('ProtectedRoute: Sesión encontrada:', currentSession);
          setSession(currentSession);
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        setSession(null);
        
        // Solo mostrar error si no estamos en la página de autenticación
        if (!location.pathname.startsWith('/auth')) {
          toast({
            title: "Error inesperado",
            description: "Ha ocurrido un error al verificar tu sesión.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Validar flujo de restablecimiento de contraseña
    const isResetPasswordRoute = () => {
      return location.pathname.startsWith('/reset-password');
    };
    
    // Verificar si la ruta actual requiere autenticación
    const isProtectedRoute = () => {
      // Estas rutas no necesitan protección
      const publicRoutes = [
        '/auth',
        '/reset-password',
      ];
      
      const isPublic = publicRoutes.some(route => 
        location.pathname === route || 
        location.pathname.startsWith(route + '/') ||
        (location.pathname === '/' && location.search.includes('type=recovery'))
      );
      
      return !isPublic;
    };

    // Verificación especial para rutas de restablecimiento de contraseña
    if (isResetPasswordRoute() || location.search.includes('type=recovery') || location.search.includes('code=')) {
      console.log('ProtectedRoute: Permitiendo acceso a ruta de restablecimiento de contraseña');
      setLoading(false);
      return;
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('ProtectedRoute: Cambio de estado de auth:', event);
      if (event === 'SIGNED_OUT') {
        // Solo mostrar mensaje si no estamos en la página de autenticación
        if (!location.pathname.startsWith('/auth')) {
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente.",
          });
          
          if (isProtectedRoute()) {
            navigate('/auth', { replace: true });
          }
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // Redirigir a la página de restablecimiento de contraseña
        navigate('/reset-password', { replace: true });
      }
      setSession(session);
    });

    return () => {
      console.log('ProtectedRoute: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Permitir siempre el acceso a rutas de restablecimiento de contraseña independientemente del estado de autenticación
  if (location.pathname.startsWith('/reset-password') || 
      location.search.includes('type=recovery') || 
      location.search.includes('code=')) {
    return <>{children}</>;
  }

  // Permitir siempre el acceso a la página de autenticación
  if (location.pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Para rutas protegidas, verificar si el usuario está autenticado
  if (!session && !location.pathname.startsWith('/auth')) {
    // Manejamos esta redirección en el useEffect para evitar actualizaciones de estado de React durante la renderización
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
