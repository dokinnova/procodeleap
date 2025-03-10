
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      const emailParam = searchParams.get("email");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      console.log("Verificando parámetros de URL para reset:");
      console.log("Token:", token ? "Presente" : "No presente");
      console.log("Code:", code ? "Presente" : "No presente");
      console.log("Type:", type);
      console.log("Email:", emailParam);
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
      
      // Check if we already have an active session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log("Sesión activa encontrada:", sessionData.session);
        setSession(sessionData.session);
        setIsTokenValid(true);
        setTokenChecked(true);
        return;
      }
      
      // Handle token-based reset
      if (token) {
        try {
          console.log("Validando token de recuperación");
          // We don't actually validate the token here, we'll let the update password operation handle that
          // Just set as valid so the form shows up
          setIsTokenValid(true);
          setTokenChecked(true);
        } catch (err) {
          console.error("Error al verificar token:", err);
          setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          setIsTokenValid(false);
          setTokenChecked(true);
        }
        return;
      }
      
      // Handle code-based reset
      if (code) {
        try {
          console.log("Validando código OTP:", code);
          
          // Check if code looks valid by format (don't actually verify yet)
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (code && uuidPattern.test(code)) {
            console.log("Código parece válido por formato");
            setIsTokenValid(true);
          } else {
            console.log("Formato de código inválido");
            setError("El enlace de recuperación es inválido. Por favor solicita uno nuevo.");
            setIsTokenValid(false);
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
