
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
  
  // Extraer email del parámetro de URL si está disponible
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
    
    // Validar contraseñas
    const { isValid, error: validationError } = validatePasswords();
    if (!isValid) {
      setError(validationError);
      return;
    }
    
    // Si usamos code-based reset, el email es requerido
    const code = searchParams.get("code");
    if (code && !email) {
      setError("Por favor ingresa tu correo electrónico para verificar tu identidad");
      return;
    }
    
    try {
      console.log("Iniciando actualización de contraseña");
      
      // Verificar si ya tenemos una sesión activa
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;
      
      console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
      
      // Enfoque 1: Actualizar con sesión existente
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
      
      // Enfoque 2: Verificar OTP primero, luego actualizar contraseña
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
      } else if (searchParams.has("token") || searchParams.has("access_token") || searchParams.has("refresh_token")) {
        // Enfoque 3: Recuperación basada en token (cuando el token está en la URL)
        console.log("Intentando actualizar con token de la URL");
        
        // En este punto, Supabase debería haber establecido la sesión si el token es válido
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
