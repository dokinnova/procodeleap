
import { useState } from "react";
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
      const token = searchParams.get("token");
      
      console.log("Intentando actualizar contraseña");
      console.log("Código:", code);
      console.log("Token:", token);
      console.log("Email:", email);
      console.log("Sesión:", !!session);
      
      // Approach 1: Direct password update with existing session
      if (session) {
        console.log("Actualizando contraseña con sesión existente");
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("Error al actualizar con sesión:", updateError);
          throw updateError;
        } else {
          // Success - password updated successfully
          toast.success("¡Tu contraseña ha sido actualizada correctamente!");
          setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
          return;
        }
      }
      
      // Approach 2: Using OTP code with email for recovery
      if (code && email) {
        console.log("Verificando OTP con email:", email);
        
        try {
          const { error: verifyError, data } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery',
          });
          
          if (verifyError) {
            console.error("Error al verificar OTP:", verifyError);
            
            // If the error suggests expired token, throw specific error
            if (verifyError.message && (
              verifyError.message.includes("expired") || 
              verifyError.message.includes("invalid") ||
              verifyError.message.includes("not found")
            )) {
              throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
            }
            
            throw verifyError;
          }
          
          // OTP verification successful, we should now have a session
          if (data?.session) {
            console.log("OTP verificado exitosamente, sesión obtenida");
            
            // Update password with the new session
            const { error: updateError } = await supabase.auth.updateUser({
              password: password
            });
            
            if (updateError) {
              console.error("Error al actualizar contraseña después de OTP:", updateError);
              throw updateError;
            }
            
            // Success!
            toast.success("¡Tu contraseña ha sido actualizada correctamente!");
            setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
            setTimeout(() => {
              navigate("/auth");
            }, 2000);
            return;
          } else {
            console.error("No se obtuvo sesión después de verificar OTP");
            throw new Error("No se pudo establecer una sesión para actualizar la contraseña");
          }
        } catch (verifyErr: any) {
          // Specific known error, re-throw to be caught by outer handler
          if (verifyErr.message === "El enlace de recuperación ha expirado. Por favor solicita uno nuevo.") {
            throw verifyErr;
          }
          
          console.error("Error específico en verificación OTP:", verifyErr);
          throw new Error("No se pudo verificar el código de recuperación. Por favor solicita uno nuevo.");
        }
      }
      
      // Approach 3: Using token-based recovery (when token is present in URL)
      if (token) {
        console.log("Intentando actualizar con token en URL");
        
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("Error al actualizar con token URL:", updateError);
          
          // Check if error suggests session is missing or invalid
          if (updateError.message && (
            updateError.message.includes("Auth session missing") ||
            updateError.message.includes("Invalid JWT")
          )) {
            throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
          }
          
          throw updateError;
        } else {
          // Success!
          toast.success("¡Tu contraseña ha sido actualizada correctamente!");
          setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
          return;
        }
      }
      
      // If we've reached this point, we couldn't update the password
      throw new Error("No se pudo establecer una sesión válida para actualizar la contraseña. Por favor solicita un nuevo enlace de recuperación.");
      
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      
      // Handle specific known error messages
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
        setError("Ocurrió un error al actualizar la contraseña" + (err.message ? `: ${err.message}` : ""));
      }
    } finally {
      setLoading(false);
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
