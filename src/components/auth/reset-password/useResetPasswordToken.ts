
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
    // Extraer token de múltiples fuentes posibles
    const getTokenFromUrl = () => {
      // Verificar parámetros de URL (query string)
      const queryParams = new URLSearchParams(location.search);
      
      // Verificar varios nombres de parámetros utilizados en diferentes flujos
      const code = queryParams.get("code"); // Para formato ?code=xxx
      const token = queryParams.get("token"); // Para formato ?token=xxx
      const type = queryParams.get("type"); // Para formato ?type=recovery
      
      // Verificar parámetros de ruta de diferentes patrones de ruta
      const routeToken = params.token; // Para /reset-password/:token
      
      // Verificar fragmento hash (para tokens de acceso en algunos flujos de autenticación)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      // Intentar extraer token de la ruta si está en un formato no estándar
      const pathSegments = location.pathname.split('/');
      let pathToken = null;
      
      // Buscar token o código en la ruta URL
      for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i] === 'token' || pathSegments[i] === 'code') {
          // El token podría estar en el siguiente segmento
          pathToken = pathSegments[i + 1];
          break;
        }
      }
      
      console.log("Detalles de extracción de token:");
      console.log("- Parámetro code:", code);
      console.log("- Parámetro token:", token);
      console.log("- Parámetro type:", type);
      console.log("- Token de ruta:", routeToken);
      console.log("- Token de ruta:", pathToken);
      console.log("- Token de acceso (hash):", accessToken);
      
      // Devolver el primer token válido encontrado
      return code || token || routeToken || pathToken || (type === "recovery" ? "recovery-flow" : null) || accessToken;
    };
    
    const token = getTokenFromUrl();
    
    if (token) {
      console.log("Token de recuperación encontrado:", token);
      setRecoveryToken(token);
      setError(null);
    } else {
      console.log("No se encontró token de recuperación en URL");
      
      // Verificar si esto es un flujo de recuperación sin un token en la URL
      const isRecoveryFlow = location.search.includes("type=recovery") || 
                            location.pathname.includes("reset-password");
      
      if (isRecoveryFlow) {
        console.log("Flujo de recuperación detectado sin token");
        // Esta es la página de iniciación, permitir solicitud de restablecimiento de contraseña
        setRecoveryToken("recovery-flow");
      } else {
        // Verificar si el usuario tiene una sesión activa
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            console.log("Sesión activa encontrada durante la recuperación");
            setRecoveryToken("session-active");
          } else if (location.search || window.location.hash) {
            // Mostrar error solo si esperábamos un token
            setError("Enlace de recuperación inválido o expirado.");
          }
        });
      }
    }
  }, [location, params]);

  return { recoveryToken, error };
};
