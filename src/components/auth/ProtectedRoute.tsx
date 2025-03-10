
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
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Verificando sesión...');
    
    // Verificar si la ruta actual requiere autenticación
    const isProtectedRoute = () => {
      // Estas rutas no necesitan protección
      const publicRoutes = [
        '/auth',
        '/reset-password',
      ];
      
      return !publicRoutes.some(route => 
        location.pathname === route || 
        location.pathname.startsWith(route + '/') ||
        (location.pathname === '/' && (
          location.search.includes('type=recovery') || 
          location.search.includes('code=')
        ))
      );
    };
    
    // Verificación especial para rutas de restablecimiento de contraseña
    if (location.pathname.startsWith('/reset-password') || 
        location.search.includes('type=recovery') || 
        location.search.includes('code=')) {
      console.log('ProtectedRoute: Permitiendo acceso a ruta de restablecimiento de contraseña');
      setLoading(false);
      setIsInitialCheck(false);
      return;
    }

    // Si es la página de auth, no es necesario verificar la sesión para evitar redirecciones innecesarias
    if (location.pathname === '/auth') {
      console.log('ProtectedRoute: En página auth, no verificando sesión');
      setLoading(false);
      setIsInitialCheck(false);
      return;
    }
    
    const checkSession = async () => {
      try {
        console.log('ProtectedRoute: Verificando sesión para ruta protegida');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error al verificar sesión:', error);
          setSession(null);
          
          if (isProtectedRoute()) {
            // Solo redirigir, no mostrar mensaje en la primera carga
            if (!isInitialCheck) {
              toast({
                title: "Error de autenticación",
                description: "Por favor, inicia sesión de nuevo.",
                variant: "destructive",
              });
            }
            console.log('ProtectedRoute: Redirigiendo a /auth debido a error de sesión');
            navigate('/auth', { replace: true });
          }
        } else if (!currentSession) {
          console.log('ProtectedRoute: No se encontró sesión');
          setSession(null);
          
          if (isProtectedRoute()) {
            // Solo redirigir, no mostrar mensaje en la primera carga
            console.log('ProtectedRoute: Redirigiendo a /auth porque no hay sesión');
            navigate('/auth', { replace: true });
          }
        } else {
          console.log('ProtectedRoute: Sesión encontrada:', currentSession);
          setSession(currentSession);
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        setSession(null);
        
        // Solo mostrar error si no es la primera verificación
        if (!isInitialCheck && !location.pathname.startsWith('/auth')) {
          toast({
            title: "Error inesperado",
            description: "Ha ocurrido un error al verificar tu sesión.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
        setIsInitialCheck(false);
      }
    };

    // Solo verificar la sesión para rutas protegidas
    if (isProtectedRoute()) {
      checkSession();
    } else {
      setLoading(false);
      setIsInitialCheck(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('ProtectedRoute: Cambio de estado de auth:', event);
      
      setSession(newSession);
      
      // No mostrar mensajes durante la verificación inicial
      if (isInitialCheck) return;
      
      if (event === 'SIGNED_OUT' && !location.pathname.startsWith('/auth')) {
        // Solo mostrar mensaje si no estamos en la página de autenticación
        // y no es la primera verificación
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
        });
        
        if (isProtectedRoute()) {
          navigate('/auth', { replace: true });
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // Redirigir a la página de restablecimiento de contraseña
        navigate('/reset-password', { replace: true });
      }
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

  // Auth page should always be accessible
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Permitir siempre el acceso a rutas de restablecimiento de contraseña
  if (location.pathname.startsWith('/reset-password') || 
      location.search.includes('type=recovery') || 
      location.search.includes('code=')) {
    return <>{children}</>;
  }

  // Para rutas protegidas, verificar si el usuario está autenticado
  if (!session && !location.pathname.startsWith('/auth')) {
    // Manejamos esta redirección en el useEffect para evitar actualizaciones de estado
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
