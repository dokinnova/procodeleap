
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PasswordResetMode = "request" | "reset";

export const usePasswordResetMode = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<PasswordResetMode>("request");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Limpiar mensajes de error y éxito al montar el componente
    setError(null);
    setSuccess(null);
    setIsTokenValid(false);
    
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    console.log("Verificando parámetros de URL:");
    console.log("Token:", token);
    console.log("Code:", code);
    console.log("Type:", type);
    console.log("Error:", errorParam);
    console.log("Error Description:", errorDescription);
    
    if (errorParam && errorDescription) {
      if (errorDescription.includes("expired")) {
        setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
        setMode("request");
        return;
      } else if (errorDescription.includes("Email link")) {
        setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
        setMode("request");
        return;
      } else {
        setError(`Error: ${errorDescription}`);
      }
    }
    
    // Si tiene token o código, y no hay error, cambiamos a modo reset
    if ((token || code) && !errorParam) {
      console.log("Estableciendo modo reset");
      setMode("reset");
      
      // Si tiene un código de recuperación pero no un token, verificamos la sesión
      if (code && !token) {
        const handleSupabaseCode = async () => {
          try {
            console.log("Verificando sesión con código");
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              console.log("Sesión encontrada:", currentSession);
              setSession(currentSession);
              setIsTokenValid(true);
              return;
            }
            
            // Verificar si el código es válido sin verificarlo aún
            const checkToken = async () => {
              try {
                // Solo verificamos que el token exista, no lo consumimos
                // Esta operación solo comprueba si el token existe, no lo valida completamente
                console.log("Verificando existencia del código de recuperación");
                
                // Intentar obtener el token sin validarlo completamente
                const response = await fetch(`${supabase.auth.url}/verify?type=recovery&token_hash=${code}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabase.supabaseKey as string,
                  },
                  redirect: 'manual', // Importante para evitar la redirección automática
                });
                
                // Si el token existe, el servidor responderá con un 303 o similar
                if (response.status !== 404 && response.status !== 400) {
                  console.log("Código válido detectado");
                  setIsTokenValid(true);
                  // Si no hay sesión, necesitamos el email para verificar el código
                  console.log("No hay sesión, solicitando email");
                  toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
                } else {
                  console.error("El código parece no ser válido");
                  setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
                  setMode("request");
                }
              } catch (err) {
                console.error("Error al verificar la existencia del token:", err);
                // Asumimos que el token puede ser válido y dejamos que el usuario intente verificarlo
                setIsTokenValid(true);
                toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
              }
            };
            
            await checkToken();
            
          } catch (err) {
            console.error("Error al verificar la sesión:", err);
            toast.error("Ocurrió un error al procesar tu solicitud");
            setError("Ocurrió un error al procesar tu solicitud");
          }
        };
        
        handleSupabaseCode();
      } else if (token) {
        // Si hay un token JWT, asumimos que es válido por ahora
        setIsTokenValid(true);
      }
    } else if (!token && !code) {
      console.log("No hay token ni código, estableciendo modo request");
      setMode("request");
    }
  }, [searchParams]);

  return {
    mode,
    error,
    setError,
    success,
    setSuccess,
    session,
    setSession,
    isTokenValid
  };
};
