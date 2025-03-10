
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePasswordValidation } from "./usePasswordValidation";
import { useOtpVerification } from "./useOtpVerification";
import { usePasswordUpdateSubmit } from "./usePasswordUpdateSubmit";
import { useTokenVerification } from "./useTokenVerification";

export const useResetFormSubmit = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  
  const {
    verifySession,
    verifyCodeWithEmail
  } = useTokenVerification();
  
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validatePasswords
  } = usePasswordValidation();
  
  const {
    verificationAttempted,
    setVerificationAttempted,
    verifyOtp
  } = useOtpVerification();
  
  const {
    loading,
    error,
    success,
    setError,
    setSuccess,
    updatePassword
  } = usePasswordUpdateSubmit();
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    const { isValid, error: validationError } = validatePasswords();
    if (!isValid) {
      setError(validationError);
      return;
    }
    
    // If using code-based reset, email is required
    const code = searchParams.get("code");
    if (code && !email) {
      setError("Por favor ingresa tu correo electrónico para verificar tu identidad");
      return;
    }
    
    try {
      console.log("Iniciando actualización de contraseña");
      
      // Check if we already have an active session
      const { hasSession } = await verifySession();
      
      // Approach 1: Update with existing session
      if (hasSession) {
        console.log("Actualizando contraseña con sesión existente");
        const success = await updatePassword(password);
        
        if (success) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
        return;
      }
      
      // Approach 2: Verify OTP first, then update password
      if (code && email) {
        try {
          // Try to verify the OTP directly
          const { success: codeSuccess } = await verifyCodeWithEmail(code, email);
          
          if (codeSuccess) {
            const passwordUpdated = await updatePassword(password);
            if (passwordUpdated) {
              setTimeout(() => {
                navigate("/auth");
              }, 2000);
            }
            return;
          }
          
          // If direct verification fails, try with our custom method
          const { success: otpSuccess, error: otpError, session } = await verifyOtp(code);
          
          console.log("Resultado de verificación OTP alternativa:", { 
            success: otpSuccess, 
            error: otpError, 
            session: session ? "Presente" : "Ausente" 
          });
          
          if (!otpSuccess) {
            setError(otpError);
            return;
          }
          
          const passwordUpdated = await updatePassword(password);
          if (passwordUpdated) {
            setTimeout(() => {
              navigate("/auth");
            }, 2000);
          }
        } catch (verifyErr) {
          console.error("Error en verificación:", verifyErr);
          throw verifyErr;
        }
      } else if (searchParams.has("token") || searchParams.has("access_token") || searchParams.has("refresh_token")) {
        // Approach 3: Token-based recovery (when the token is in the URL)
        console.log("Intentando actualizar con token de la URL");
        
        // At this point, Supabase should have established the session if the token is valid
        const passwordUpdated = await updatePassword(password);
        if (passwordUpdated) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
      } else {
        throw new Error("No se pudo establecer una sesión válida para actualizar la contraseña. Por favor solicita un nuevo enlace de recuperación.");
      }
    } catch (err: any) {
      console.error("Error final en actualización:", err);
      
      if (err.message && (
        err.message.includes("expired") || 
        err.message.includes("El enlace de recuperación ha expirado") ||
        err.message.includes("not found") ||
        err.message.includes("invalid") ||
        err.message.includes("Invalid") ||
        err.message.includes("Auth session missing") ||
        err.message.includes("JWT")
      )) {
        setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
      } else if (err.message && err.message.includes("User not found")) {
        setError("No se encontró ninguna cuenta con este correo electrónico. Por favor verifica e intenta de nuevo.");
      } else {
        setError(`Ocurrió un error al actualizar la contraseña: ${err.message || "Error desconocido"}`);
      }
    }
  };
  
  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    verificationAttempted,
    setVerificationAttempted,
    handleUpdatePassword,
    searchParams,
    navigate
  };
};
