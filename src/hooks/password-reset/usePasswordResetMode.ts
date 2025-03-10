
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
      
      // Chequeamos todos los posibles parámetros que pueden venir en la URL
      const token = searchParams.get("token");
      const code = searchParams.get("code");
      const type = searchParams.get("type");
      const emailParam = searchParams.get("email");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      
      console.log("Verificando parámetros de URL para reset:");
      console.log("Token:", token ? "Presente" : "No presente");
      console.log("Code:", code ? "Presente" : "No presente");
      console.log("Type:", type);
      console.log("Email:", emailParam);
      console.log("Error:", errorParam);
      console.log("Error Description:", errorDescription);
      console.log("Access Token:", accessToken ? "Presente" : "No presente");
      console.log("Refresh Token:", refreshToken ? "Presente" : "No presente");
      
      // Si hay errores explícitos en la URL, los mostramos
      if (errorParam || errorDescription) {
        console.log("Error detectado en parámetros de URL");
        setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
        setMode("request");
        setTokenChecked(true);
        setForceRequestMode(true);
        return;
      }
      
      // Si no hay token, code ni access_token, permanecemos en modo solicitud
      if (!token && !code && !accessToken && !refreshToken) {
        console.log("No hay token, código ni access_token, estableciendo modo request");
        setMode("request");
        setTokenChecked(true);
        return;
      }
      
      // Si llegamos aquí es porque tenemos un token, code o access_token, así que cambiamos al modo reset
      setMode("reset");
      
      // Verificamos si ya tenemos una sesión activa
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sesión actual:", sessionData?.session ? "Presente" : "Ausente");
      
      if (sessionData?.session) {
        console.log("Sesión activa encontrada");
        setSession(sessionData.session);
        setIsTokenValid(true);
        setTokenChecked(true);
        return;
      }
      
      // Intentamos establecer la sesión usando el código o token de la URL si existe
      if (code && type === "recovery" && emailParam) {
        try {
          console.log("Intentando verificar código de recuperación directamente");
          // Verificar el OTP (código de un solo uso)
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email: emailParam,
            token: code,
            type: 'recovery'
          });
          
          if (verifyError) {
            console.error("Error al verificar OTP:", verifyError);
            if (verifyError.message && (
              verifyError.message.includes("expired") || 
              verifyError.message.includes("invalid") ||
              verifyError.message.includes("not found")
            )) {
              setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
            } else {
              setError(verifyError.message);
            }
            setIsTokenValid(false);
          } else if (data?.session) {
            console.log("OTP verificado con éxito, sesión establecida");
            setSession(data.session);
            setIsTokenValid(true);
          } else {
            console.log("OTP verificado pero no se obtuvo sesión");
            setIsTokenValid(true); // Consideramos que es válido para mostrar el formulario
          }
        } catch (err) {
          console.error("Error al verificar código:", err);
          setError("Ocurrió un error al verificar el enlace de recuperación");
          setIsTokenValid(false);
        }
        setTokenChecked(true);
        return;
      }
      
      // Para todos los demás casos (token, access_token, etc.)
      if (token || accessToken || refreshToken || (code && type === "recovery")) {
        try {
          console.log("Asumiendo token válido para formulario de restablecimiento");
          setIsTokenValid(true);
        } catch (err) {
          console.error("Error al validar token:", err);
          setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
          setIsTokenValid(false);
        }
        setTokenChecked(true);
        return;
      }
      
      console.log("No se encontró un método válido de recuperación en la URL");
      setError("El enlace de recuperación es inválido. Por favor solicita uno nuevo.");
      setIsTokenValid(false);
      setTokenChecked(true);
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
