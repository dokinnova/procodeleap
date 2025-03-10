
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useResetPasswordToken = () => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const params = useParams();

  // Logs de depuración para ayudar a solucionar problemas
  console.log("ResetPassword: Componente cargado con:");
  console.log("- URL:", window.location.href);
  console.log("- Location search:", location.search);
  console.log("- Location hash:", window.location.hash);
  console.log("- Route params:", params);

  useEffect(() => {
    const extractTokenFromUrl = () => {
      // 1. Extraer de query params
      const searchParams = new URLSearchParams(location.search);
      const queryToken = searchParams.get('token');
      const queryCode = searchParams.get('code');
      const queryType = searchParams.get('type');
      
      // 2. Extraer de URL path parameters 
      const routeToken = params.token;
      
      // 3. Extraer de hash fragment (#)
      let hashToken = null;
      try {
        // A veces el token puede estar en el hash como #access_token=xxx
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashToken = hashParams.get('access_token');
        }
      } catch (e) {
        console.error("Error al parsear hash:", e);
      }
      
      console.log("Tokens extraídos:", { queryToken, queryCode, routeToken, hashToken });
      
      // Devolver el primer token válido encontrado
      return queryToken || queryCode || routeToken || hashToken || 
             (queryType === 'recovery' ? 'recovery-flow' : null);
    };

    const processAuthSession = async () => {
      // Verificar primero si hay parámetros en la URL
      const token = extractTokenFromUrl();
      
      if (token) {
        console.log("Token encontrado en URL:", token);
        setRecoveryToken(token);
        
        // Si tenemos un código de autenticación real (no el indicador "recovery-flow")
        if (token !== 'recovery-flow') {
          // Intentar procesar explícitamente el token o código con Supabase
          try {
            // Esto es necesario para que Supabase procese el código de autenticación
            const { data, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("Error al obtener sesión con token:", sessionError);
              setError(sessionError.message);
            } else {
              console.log("Sesión obtenida después de procesar token:", data.session ? "Válida" : "No hay sesión");
            }
          } catch (err) {
            console.error("Error al procesar token de autenticación:", err);
          }
        }
      } else {
        console.log("No se encontró token en URL, verificando estado de sesión...");
        
        // Si estamos en la ruta de reset-password pero sin token, asumimos que es
        // la página de solicitud de recuperación 
        if (location.pathname.includes('reset-password')) {
          setRecoveryToken('recovery-flow');
        } else {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log("Sesión activa encontrada, usuario ya autenticado");
            setRecoveryToken('session-active');
          } else {
            console.log("No hay sesión activa y no se encontró token");
            setRecoveryToken(null);
          }
        }
      }
    };

    processAuthSession();
    
    // Suscribirse a cambios de autenticación para actualizar el estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de autenticación:", event, session ? "Con sesión" : "Sin sesión");
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Evento PASSWORD_RECOVERY detectado");
        setRecoveryToken('recovery-token-event');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [location, params]);

  return { recoveryToken, error };
};
