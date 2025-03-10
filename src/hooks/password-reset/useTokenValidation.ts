
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
    console.log("Verificando código de recuperación para:", email);
    
    try {
      // Try to verify the code with Supabase's built-in method
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al verificar código:", verifyError);
        throw verifyError;
      }
      
      if (data?.session) {
        setSession(data.session);
        setIsTokenValid(true);
      }
      
      console.log("Verificación exitosa:", data?.session ? "Sesión establecida" : "Sin sesión");
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
    console.log("Validando token para reset de contraseña...");
    
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
      
      // If we have a token or code, attempt to verify it
      if (token || code || accessToken || refreshToken) {
        // Check if we already have a session
        const { hasSession, session: currentSession } = await verifySession();
        
        if (hasSession && currentSession) {
          console.log("Sesión existente detectada");
          setSession(currentSession);
          setIsTokenValid(true);
          return { success: true };
        }
        
        // For recovery code with email
        if (code && emailParam && type === 'recovery') {
          try {
            const { success, session: verifiedSession } = await verifyCodeWithEmail(code, emailParam);
            
            if (success && verifiedSession) {
              setIsTokenValid(true);
              setSession(verifiedSession);
              return { success: true };
            }
          } catch (err) {
            console.error("Error al verificar código:", err);
            return { 
              error: "El enlace de recuperación es inválido. Por favor solicita uno nuevo.", 
              setRequestMode: true 
            };
          }
        }
        
        // Fallback to request mode if verification fails
        console.log("No se pudo verificar el token/código");
        setForceRequestMode(true);
        return { 
          error: "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.", 
          setRequestMode: true 
        };
      }
      
      // No token or code, default to request mode
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
