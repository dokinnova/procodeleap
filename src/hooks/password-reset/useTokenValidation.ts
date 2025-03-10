
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const useTokenValidation = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [forceRequestMode, setForceRequestMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const verifySession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    
    console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
    
    if (currentSession) {
      setSession(currentSession);
    }
    
    return { hasSession: !!currentSession, session: currentSession };
  };
  
  const verifyCodeWithEmail = async (code: string, email: string) => {
    console.log("Verificando código de recuperación:", code, "para email:", email);
    
    try {
      // Verificar que tenemos la sesión más reciente
      await verifySession();
      
      // Primero intentar intercambiar el código por una sesión directamente
      try {
        console.log("Intentando intercambiar código por sesión");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error al intercambiar código por sesión:", error);
        } else if (data?.session) {
          console.log("Código intercambiado exitosamente por sesión");
          setSession(data.session);
          setIsTokenValid(true);
          return { success: true, session: data.session };
        }
      } catch (exchangeErr) {
        console.error("Error al intercambiar código:", exchangeErr);
      }
      
      // Si el intercambio directo falló, intentar verificar OTP
      console.log("Intentando verificar como OTP");
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al verificar OTP:", verifyError);
        throw verifyError;
      }
      
      if (data?.session) {
        console.log("Verificación OTP exitosa, sesión establecida");
        setSession(data.session);
        setIsTokenValid(true);
      }
      
      return { success: true, session: data?.session };
    } catch (err) {
      console.error("Error en verificación:", err);
      return { success: false, error: err };
    }
  };
  
  const validateToken = async (
    token?: string | null,
    code?: string | null,
    type?: string | null,
    emailParam?: string | null,
    errorParam?: string | null, 
    errorDescription?: string | null,
    accessToken?: string | null,
    refreshToken?: string | null
  ) => {
    console.log("Validando token/código para reset de contraseña...");
    console.log("Parámetros:", { token, code, type, emailParam, accessToken: accessToken ? "Presente" : "No presente" });
    
    try {
      // Mark as checked to stop showing loading state
      setTokenChecked(true);
      
      // Check for error parameters in URL
      if (errorParam) {
        console.error("Error en parámetros de URL:", errorParam, errorDescription);
        return { 
          error: errorDescription || "Error en el enlace de recuperación", 
          setRequestMode: true 
        };
      }
      
      // If we have a token, code, or access token, attempt to verify
      if (token || code || accessToken || refreshToken) {
        // First check if we already have an active session
        const { hasSession, session: currentSession } = await verifySession();
        
        if (hasSession && currentSession) {
          console.log("Sesión existente detectada");
          setSession(currentSession);
          setIsTokenValid(true);
          return { success: true };
        }
        
        // Handle recovery code with email parameter
        if (code && emailParam && type === 'recovery') {
          console.log("Intentando verificar código con email proporcionado");
          const { success, session: verifiedSession } = await verifyCodeWithEmail(code, emailParam);
          
          if (success && verifiedSession) {
            setIsTokenValid(true);
            setSession(verifiedSession);
            return { success: true };
          }
        }
        
        // Handle just a code (from Supabase's auth.resetPasswordForEmail)
        if (code) {
          console.log("Código de recuperación sin email, intentando directamente");
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error al intercambiar código:", error);
            } else if (data?.session) {
              console.log("Código intercambiado exitosamente, sesión establecida");
              setSession(data.session);
              setIsTokenValid(true);
              return { success: true };
            }
          } catch (exchangeErr) {
            console.error("Error al intercambiar código:", exchangeErr);
          }
        }
        
        // Handle access token and refresh token
        if (accessToken && refreshToken) {
          console.log("Intentando usar tokens de acceso y refresco");
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error("Error al establecer sesión con tokens:", error);
            } else if (data?.session) {
              console.log("Sesión establecida con tokens");
              setSession(data.session);
              setIsTokenValid(true);
              return { success: true };
            }
          } catch (setSessionErr) {
            console.error("Error al establecer sesión:", setSessionErr);
          }
        }
        
        // If all verification attempts failed
        console.log("No se pudo verificar el token/código");
        setForceRequestMode(true);
        return { 
          error: "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.", 
          setRequestMode: true 
        };
      }
      
      // No token, code, or access token parameters
      console.log("No se encontró token o código en URL, modo solicitud");
      setForceRequestMode(true);
      return { setRequestMode: true };
    } catch (err: any) {
      console.error("Error en validación de token:", err);
      setTokenChecked(true);
      setForceRequestMode(true);
      return { 
        error: err.message || "Error al validar el enlace de recuperación", 
        setRequestMode: true 
      };
    }
  };
  
  return {
    verifySession,
    verifyCodeWithEmail,
    validateToken,
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession
  };
};
