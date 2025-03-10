
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOtpVerification = () => {
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [email, setEmail] = useState("");
  
  const verifyOtp = async (code: string): Promise<{ success: boolean; error: string | null; session: any }> => {
    if (!code) {
      return { 
        success: false, 
        error: "Código inválido", 
        session: null 
      };
    }
    
    if (!email) {
      return { 
        success: false, 
        error: "Por favor ingresa tu correo electrónico para verificar tu identidad", 
        session: null 
      };
    }
    
    setVerificationInProgress(true);
    setVerificationAttempted(true);
    
    try {
      console.log("Intentando verificar OTP para:", email, "con código:", code);
      
      // First check if we already have a session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log("Sesión existente encontrada, no es necesario verificar OTP");
        return { success: true, error: null, session: sessionData.session };
      }
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al verificar OTP:", verifyError);
        
        if (verifyError.message && (
          verifyError.message.includes("expired") || 
          verifyError.message.includes("invalid") ||
          verifyError.message.includes("not found") ||
          verifyError.message.includes("token has expired") ||
          verifyError.message.includes("token is invalid") ||
          verifyError.message.includes("otp_expired") ||
          verifyError.message.includes("otp not found")
        )) {
          return { 
            success: false, 
            error: "El enlace de recuperación ha expirado. Por favor solicita uno nuevo.", 
            session: null 
          };
        }
        
        return { success: false, error: verifyError.message, session: null };
      }
      
      if (!data?.session) {
        console.error("Verificación exitosa pero no se obtuvo sesión");
        return { 
          success: false, 
          error: "No se pudo establecer una sesión para actualizar la contraseña", 
          session: null 
        };
      }
      
      console.log("Verificación OTP exitosa, sesión obtenida:", data.session ? "Presente" : "Ausente");
      return { success: true, error: null, session: data.session };
    } catch (err: any) {
      console.error("Error en verificación OTP:", err);
      
      if (err.message && (
        err.message.includes("expired") || 
        err.message.includes("invalid") ||
        err.message.includes("token has expired") ||
        err.message.includes("token is invalid")
      )) {
        return { 
          success: false, 
          error: "El enlace de recuperación ha expirado. Por favor solicita uno nuevo.", 
          session: null 
        };
      }
      
      return { 
        success: false, 
        error: err.message || "Error desconocido al verificar el código", 
        session: null 
      };
    } finally {
      setVerificationInProgress(false);
    }
  };
  
  return {
    email,
    setEmail,
    verificationAttempted,
    setVerificationAttempted,
    verificationInProgress,
    verifyOtp
  };
};
