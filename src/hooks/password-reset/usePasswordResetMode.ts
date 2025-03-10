
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

  useEffect(() => {
    // Limpiar mensajes de error y éxito al montar el componente
    setError(null);
    setSuccess(null);
    
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    console.log("Token:", token);
    console.log("Code:", code);
    console.log("Type:", type);
    console.log("Error:", errorParam);
    console.log("Error Description:", errorDescription);
    
    if (errorParam && errorDescription) {
      if (errorDescription.includes("expired")) {
        setError("El enlace ha expirado. Por favor solicita un nuevo enlace de recuperación.");
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
              return;
            }
            
            // Si no hay sesión, necesitamos el email para verificar el código
            console.log("No hay sesión, solicitando email");
            toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
          } catch (err) {
            console.error("Error al verificar la sesión:", err);
            toast.error("Ocurrió un error al procesar tu solicitud");
            setError("Ocurrió un error al procesar tu solicitud");
          }
        };
        
        handleSupabaseCode();
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
    setSession
  };
};
