
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Verificando ruta', location.pathname);
    
    // Estas rutas no necesitan protección y no deben redirigir
    const publicRoutes = [
      '/auth',
      '/reset-password',
    ];
    
    const isPublicRoute = publicRoutes.some(route => 
      location.pathname === route || 
      location.pathname.startsWith(route + '/') ||
      location.search.includes('type=recovery') || 
      location.search.includes('code=')
    );
    
    // Si es una ruta pública, no verificamos la sesión
    if (isPublicRoute) {
      console.log('ProtectedRoute: En ruta pública, no verificando sesión');
      setLoading(false);
      return;
    }

    // Para rutas protegidas, verificar sesión
    const checkSession = async () => {
      try {
        console.log('ProtectedRoute: Verificando sesión para ruta protegida');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('ProtectedRoute: No se encontró sesión, redirigiendo a /auth');
          setSession(null);
          navigate('/auth', { replace: true });
        } else {
          console.log('ProtectedRoute: Sesión encontrada');
          setSession(currentSession);
        }
      } catch (error) {
        console.error('ProtectedRoute: Error:', error);
        setSession(null);
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    // Solo verificar sesión para rutas protegidas
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('ProtectedRoute: Cambio de estado de auth:', event);
      
      if (isPublicRoute) return;
      
      setSession(newSession);
      
      if (event === 'SIGNED_OUT' && !isPublicRoute) {
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
