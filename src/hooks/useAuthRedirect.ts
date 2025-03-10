
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const isPublicRoute = 
    location.pathname === '/auth' || 
    location.pathname === '/password-reset' || 
    location.pathname.startsWith('/auth/callback');

  useEffect(() => {
    console.log('useAuthRedirect inicializando en ruta:', location.pathname);
    
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al verificar sesión:', error);
          setSession(null);
          setLoading(false);
          return;
        }
        
        // Actualizar estado de sesión
        setSession(data.session);
        
        // Solo verificar acceso a rutas protegidas
        if (!data.session && !isPublicRoute) {
          console.log('No hay sesión y estamos en ruta protegida, redirigiendo a /auth');
          navigate('/auth', { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error inesperado:', error);
        setSession(null);
        setLoading(false);
      }
    };

    checkSession();

    // No necesitamos duplicar la lógica de onAuthStateChange aquí
    // ya que esto ya está en AuthProvider
    
    return () => {
      console.log('Limpiando efecto de useAuthRedirect');
    };
  }, [navigate, location.pathname, isPublicRoute]);

  return { session, loading };
};
