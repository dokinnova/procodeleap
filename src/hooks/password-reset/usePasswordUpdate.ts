
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordUpdate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  // Populate email from URL if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Basic form validation
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // When using code-based reset, email is required
    const code = searchParams.get("code");
    if (code && !email) {
      setError("Por favor ingresa tu correo electrónico para verificar tu identidad");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Iniciando actualización de contraseña");
      const token = searchParams.get("token");
      
      // Check for existing session first
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;
      
      console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
      
      // Approach 1: Update with existing session
      if (currentSession) {
        console.log("Actualizando contraseña con sesión existente");
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("Error al actualizar con sesión:", updateError);
          
          if (updateError.message && (
            updateError.message.includes("Auth session missing") ||
            updateError.message.includes("JWT") ||
            updateError.message.includes("expired")
          )) {
            throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          }
          
          throw updateError;
        }
        
        console.log("Contraseña actualizada exitosamente");
        toast.success("¡Tu contraseña ha sido actualizada correctamente!");
        setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }
      
      // Approach 2: Verify OTP first, then update password
      if (code && email && !verificationInProgress) {
        console.log("Intentando verificar OTP para:", email);
        setVerificationInProgress(true);
        
        try {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery',
          });
          
          setVerificationAttempted(true);
          
          if (verifyError) {
            console.error("Error al verificar OTP:", verifyError);
            
            if (verifyError.message && (
              verifyError.message.includes("expired") || 
              verifyError.message.includes("invalid") ||
              verifyError.message.includes("not found")
            )) {
              throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
            }
            
            throw verifyError;
          }
          
          if (!data?.session) {
            console.error("Verificación exitosa pero no se obtuvo sesión");
            throw new Error("No se pudo establecer una sesión para actualizar la contraseña");
          }
          
          console.log("OTP verificado exitosamente, actualizando contraseña");
          const { error: updateError } = await supabase.auth.updateUser({
            password: password
          });
          
          if (updateError) {
            console.error("Error al actualizar contraseña después de OTP:", updateError);
            throw updateError;
          }
          
          console.log("Contraseña actualizada exitosamente");
          toast.success("¡Tu contraseña ha sido actualizada correctamente!");
          setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
          
        } catch (verifyErr: any) {
          if (verifyErr.message === "El enlace de recuperación ha expirado. Por favor solicita uno nuevo.") {
            setError(verifyErr.message);
          } else if (verifyErr.message && verifyErr.message.includes("User not found")) {
            setError("No se encontró ninguna cuenta con este correo electrónico. Por favor verifica e intenta de nuevo.");
          } else {
            console.error("Error en verificación OTP:", verifyErr);
            setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          }
          setVerificationInProgress(false);
          return;
        }
      } else if (token) {
        // Approach 3: Token-based recovery (when token is in URL)
        console.log("Intentando actualizar con token");
        
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("Error al actualizar con token URL:", updateError);
          
          if (updateError.message && (
            updateError.message.includes("Auth session missing") ||
            updateError.message.includes("JWT") ||
            updateError.message.includes("expired") ||
            updateError.message.includes("invalid")
          )) {
            throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          }
          
          throw updateError;
        }
        
        console.log("Contraseña actualizada exitosamente con token");
        toast.success("¡Tu contraseña ha sido actualizada correctamente!");
        setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
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
    } finally {
      setLoading(false);
      setVerificationInProgress(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
    session,
    setSession,
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
