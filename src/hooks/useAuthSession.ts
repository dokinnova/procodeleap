
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useAuthSession: Inicializando efecto");
    
    // Función para verificar la sesión actual
    const checkSession = async () => {
      try {
        console.log("useAuthSession: Verificando sesión...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al verificar sesión:", error);
          setSession(null);
        } else if (!currentSession) {
          console.log("No hay sesión activa");
          setSession(null);
        } else {
          console.log("Sesión encontrada:", currentSession);
          setSession(currentSession);
        }
      } catch (error) {
        console.error("Error inesperado:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    // Verificar sesión al montar el componente
    checkSession();

    // Suscribirse a cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Cambio en el estado de autenticación:", _event);
      
      // Actualizar el estado de la sesión
      setSession(newSession);
      
      // Si no hay sesión y ya ha cargado, redirigir a la página de autenticación
      if (!newSession && !loading) {
        console.log("Sesión terminada, redirigiendo a /auth");
        navigate('/auth', { replace: true });
      }
    });

    // Limpiar la suscripción al desmontar
    return () => {
      console.log("useAuthSession: Limpiando suscripción");
      subscription.unsubscribe();
    };
  }, [navigate, loading]);

  return { session, loading };
};
