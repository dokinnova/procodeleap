
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
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      setError(null);
      setSuccess(null);
      setIsTokenValid(false);
      setTokenChecked(false);
      
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
      
      // Handle explicit error parameters in URL
      if (errorParam && errorDescription) {
        if (errorDescription.includes("expired")) {
          setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          setMode("request");
          setTokenChecked(true);
          return;
        } else if (errorDescription.includes("Email link")) {
          setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
          setMode("request");
          setTokenChecked(true);
          return;
        } else {
          setError(`Error: ${errorDescription}`);
          setTokenChecked(true);
          return;
        }
      }
      
      // If no token or code is present, default to request mode
      if (!token && !code) {
        console.log("No hay token ni código, estableciendo modo request");
        setMode("request");
        setTokenChecked(true);
        return;
      }
      
      // Set to reset mode if we have a token or code
      setMode("reset");
      
      // Handle token-based reset
      if (token) {
        console.log("Token presente, asumiendo enlace válido");
        setIsTokenValid(true);
        setTokenChecked(true);
        return;
      }
      
      // Handle code-based reset
      if (code) {
        try {
          console.log("Verificando sesión actual");
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (currentSession) {
            console.log("Sesión existente encontrada:", currentSession);
            setSession(currentSession);
            setIsTokenValid(true);
            setTokenChecked(true);
            return;
          }
          
          // Since we can't directly validate OTP codes without trying a password reset,
          // we'll set it as potentially valid and let the user try
          console.log("No hay sesión activa. Permitiendo intento de restablecimiento");
          setIsTokenValid(true);
          toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
          setTokenChecked(true);
        } catch (err) {
          console.error("Error al verificar validez del token:", err);
          setError("Ocurrió un error al verificar el enlace de recuperación");
          setTokenChecked(true);
        }
      }
    };
    
    checkTokenValidity();
  }, [searchParams]);

  return {
    mode,
    error,
    setError,
    success,
    setSuccess,
    session,
    setSession,
    isTokenValid,
    tokenChecked
  };
};
