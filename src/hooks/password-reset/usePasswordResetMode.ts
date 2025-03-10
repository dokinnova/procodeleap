
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PasswordResetMode = "request" | "reset";

export const usePasswordResetMode = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<PasswordResetMode>("request");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [forceRequestMode, setForceRequestMode] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      setError(null);
      setSuccess(null);
      setIsTokenValid(false);
      setTokenChecked(false);
      setForceRequestMode(false);
      
      const token = searchParams.get("token");
      const code = searchParams.get("code");
      const type = searchParams.get("type");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      console.log("Verificando parámetros de URL:");
      console.log("Token:", token ? "Present" : "Not present");
      console.log("Code:", code ? "Present" : "Not present");
      console.log("Type:", type);
      console.log("Error:", errorParam);
      console.log("Error Description:", errorDescription);
      
      // Handle explicit error parameters in URL
      if (errorParam || errorDescription) {
        console.log("Error detectado en parámetros de URL");
        setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
        setMode("request");
        setTokenChecked(true);
        setForceRequestMode(true);
        return;
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
        try {
          console.log("Validando sesión con token");
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error al obtener sesión:", sessionError);
            throw sessionError;
          }
          
          if (data?.session) {
            console.log("Sesión válida encontrada");
            setSession(data.session);
            setIsTokenValid(true);
          } else {
            console.log("No hay sesión activa con el token proporcionado");
            setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
            setIsTokenValid(false);
          }
        } catch (err) {
          console.error("Error al verificar token:", err);
          setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          setIsTokenValid(false);
        } finally {
          setTokenChecked(true);
        }
        return;
      }
      
      // Handle code-based reset
      if (code) {
        try {
          console.log("Verificando sesión actual con código OTP");
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error al obtener sesión:", sessionError);
          }
          
          if (currentSession) {
            console.log("Sesión existente encontrada:", currentSession);
            setSession(currentSession);
            setIsTokenValid(true);
            setTokenChecked(true);
            return;
          }
          
          // Check if code looks like a UUID (OTP format)
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (code && uuidPattern.test(code)) {
            console.log("Código parece válido por formato");
            setIsTokenValid(true);
          } else {
            console.log("Formato de código inválido");
            setError("El enlace de recuperación es inválido. Por favor solicita uno nuevo.");
            setIsTokenValid(false);
          }
          
          // Attempt to verify if the code is valid
          try {
            // We only try this to see if the code is valid, without committing to a password change yet
            const { error: verifyError } = await supabase.auth.verifyOtp({
              email: searchParams.get("email") || "",
              token: code,
              type: 'recovery'
            });
            
            if (verifyError) {
              if (verifyError.message && (
                verifyError.message.includes("token has expired") || 
                verifyError.message.includes("token is invalid") ||
                verifyError.message.includes("otp_expired")
              )) {
                console.log("Token expirado o inválido durante verificación previa");
                setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
                setIsTokenValid(false);
              }
            }
          } catch (e) {
            // Just log the error, we'll proceed anyway since the real verification happens later
            console.log("Error en verificación previa:", e);
          }
          
          setTokenChecked(true);
        } catch (err) {
          console.error("Error al verificar código:", err);
          setError("Ocurrió un error al verificar el enlace de recuperación");
          setIsTokenValid(false);
          setTokenChecked(true);
        }
      }
    };
    
    checkTokenValidity();
  }, [searchParams, navigate]);

  return {
    mode,
    error,
    setError,
    success,
    setSuccess,
    session,
    setSession,
    isTokenValid,
    tokenChecked,
    forceRequestMode
  };
};
