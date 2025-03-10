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
    
    if ((token || code) && !errorParam) {
      console.log("Estableciendo modo reset");
      setMode("reset");
      
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
            
            const checkToken = async () => {
              try {
                const apiUrl = "https://upmokuswronpozhhopts.supabase.co";
                const projectId = "upmokuswronpozhhopts";
                
                const response = await fetch(`${apiUrl}/auth/v1/verify?type=recovery&token_hash=${code}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': projectId,
                  },
                  redirect: 'manual',
                });
                
                if (response.status !== 404 && response.status !== 400) {
                  console.log("Código válido detectado");
                  setIsTokenValid(true);
                  toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
                } else {
                  console.error("El código parece no ser válido");
                  setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
                  setMode("request");
                }
              } catch (err) {
                console.error("Error al verificar la existencia del token:", err);
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
