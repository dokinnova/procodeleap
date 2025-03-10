
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { usePasswordValidation } from "./usePasswordValidation";
import { useOtpVerification } from "./useOtpVerification";
import { usePasswordUpdateSubmit } from "./usePasswordUpdateSubmit";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordUpdate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validatePasswords
  } = usePasswordValidation();
  
  const {
    email,
    setEmail,
    verificationAttempted,
    setVerificationAttempted,
    verificationInProgress,
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
  
  // Populate email from URL if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      console.log("Estableciendo email desde URL:", emailParam);
      setEmail(emailParam);
    }
  }, [searchParams, setEmail]);
  
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
    
    // When using code-based reset, email is required
    const code = searchParams.get("code");
    if (code && !email) {
      setError("Por favor ingresa tu correo electrónico para verificar tu identidad");
      return;
    }
    
    try {
      console.log("Iniciando actualización de contraseña");
      const token = searchParams.get("token");
      const code = searchParams.get("code");
      
      // Check for existing session first
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;
      
      console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
      
      // Approach 1: Update with existing session
      if (currentSession) {
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
        console.log("Verificando OTP para email:", email, "con código:", code);
        
        const { success: otpSuccess, error: otpError, session } = await verifyOtp(code);
        
        console.log("Resultado de verificación OTP:", { 
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
        return;
      } else if (token) {
        // Approach 3: Token-based recovery (when token is in URL)
        console.log("Intentando actualizar con token");
        
        const passwordUpdated = await updatePassword(password);
        if (passwordUpdated) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
        return;
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
        err.message.includes("Auth session missing")
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
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
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
