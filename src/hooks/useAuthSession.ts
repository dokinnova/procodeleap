
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Suscribirse a cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      
      if (_event === 'SIGNED_OUT' && window.location.pathname !== '/auth' && 
          !window.location.pathname.includes('/reset-password')) {
        navigate('/auth', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { session, loading };
};
