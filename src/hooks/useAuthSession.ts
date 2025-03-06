
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
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

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Cambio en el estado de autenticación:", _event);
      setSession(session);
      
      if (!session && !loading) {
        console.log("Sesión terminada, redirigiendo a /auth");
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { session, loading };
};
