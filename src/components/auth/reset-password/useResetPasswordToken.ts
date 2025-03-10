
import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useResetPasswordToken = () => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // Logs de depuración para ayudar a solucionar problemas
  console.log("ResetPassword: Componente cargado con:");
  console.log("- URL completa:", window.location.href);
  console.log("- Location pathname:", location.pathname);
  console.log("- Location search:", location.search);
  console.log("- Location hash:", location.hash);
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
      
      console.log("Tokens extraídos:", { queryToken, queryCode, routeToken, hashToken, queryType });
      
      // Devolver el primer token válido encontrado
      return queryToken || queryCode || routeToken || hashToken || 
             (queryType === 'recovery' ? 'recovery-flow' : null);
    };

    const processAuthSession = async () => {
      try {
        setIsProcessingToken(true);
        
        // Extraer token de la URL
        const token = extractTokenFromUrl();
        console.log("Token extraído de URL:", token);
        
        if (token) {
          // Si tenemos un token o código de recuperación en la URL
          console.log("Token encontrado en URL:", token);
          setRecoveryToken(token);
          
          // Si es un código de autorización real en la URL, intentamos canjearlo por una sesión
          if (location.search.includes('code=')) {
            console.log("Procesando código de recuperación:", location.search);
            
            try {
              // Este paso es crítico: intercambia el código por una sesión
              const { data, error } = await supabase.auth.exchangeCodeForSession(location.search);
              
              if (error) {
                console.error("Error al intercambiar código por sesión:", error);
                setError("Error al procesar el código de recuperación");
              } else {
                console.log("Código intercambiado exitosamente por sesión:", data);
                
                // Redirigimos a la misma página pero sin los parámetros de la URL para evitar problemas
                // al refrescar la página, pero mantenemos el token
                if (location.search) {
                  navigate(`/reset-password?processed=true`, { replace: true });
                }
              }
            } catch (exchangeError) {
              console.error("Error durante el intercambio de código:", exchangeError);
              setError("Error al procesar la autenticación");
            }
          }
        } else {
          console.log("No se encontró token en URL, verificando estado de sesión...");
          
          // Verificamos si existe una sesión de Supabase primero
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            console.log("Sesión activa encontrada, usuario ya autenticado");
            setRecoveryToken('session-active');
          } else {
            // Si estamos en la ruta de reset-password pero sin token, asumimos que es
            // la página de solicitud de recuperación
            if (location.pathname.includes('reset-password')) {
              console.log("En ruta de reset-password sin token, mostrando formulario de solicitud");
              setRecoveryToken('recovery-flow');
            } else {
              console.log("No hay sesión activa y no se encontró token");
              setRecoveryToken(null);
            }
          }
        }
      } catch (err) {
        console.error("Error al procesar sesión/token:", err);
        setError("Error al procesar la autenticación");
      } finally {
        setIsProcessingToken(false);
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
  }, [location, params, navigate]);

  return { recoveryToken, error, isProcessingToken };
};
