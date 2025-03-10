
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
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!email && !session && searchParams.get("code")) {
      setError("Por favor ingresa tu correo electrónico para verificar tu identidad");
      return;
    }

    setLoading(true);
    
    try {
      const code = searchParams.get("code");
      const token = searchParams.get("token");
      
      console.log("Actualizando contraseña");
      console.log("Código:", code);
      console.log("Token:", token);
      console.log("Email:", email);
      console.log("Sesión:", !!session);
      
      // Primero verificamos si el enlace ha expirado solicitando una nueva sesión
      if (code && email && !session) {
        console.log("Verificando si el código de recuperación aún es válido");
        
        try {
          // Intentamos verificar el código OTP
          const { error: verifyError, data } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'recovery',
          });
          
          if (verifyError) {
            console.error("Error al verificar OTP:", verifyError);
            
            // Si el error indica que el token ha expirado, lanzamos un error específico
            if (verifyError.message && (
                verifyError.message.includes("expired") || 
                verifyError.message.includes("invalid") ||
                verifyError.message.includes("not found")
            )) {
              throw new Error("Token has expired");
            }
          } else if (data?.session) {
            console.log("OTP verificado exitosamente, sesión obtenida");
            setSession(data.session);
          }
        } catch (verifyErr: any) {
          if (verifyErr.message === "Token has expired") {
            throw verifyErr;
          }
          // Si hay otro error, continuamos con el siguiente intento
          console.log("Error en verificación inicial, intentando otros métodos");
        }
      }
      
      // Si tenemos una sesión, intentamos actualizar la contraseña directamente
      if (session) {
        console.log("Actualizando contraseña con sesión existente");
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("Error al actualizar con sesión:", updateError);
          throw updateError;
        } else {
          // Éxito - la contraseña se actualizó correctamente
          toast.success("¡Tu contraseña ha sido actualizada correctamente!");
          setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
          return;
        }
      }
      
      // Si no tenemos sesión pero tenemos un código y email, intentamos otras estrategias
      if (!session && code && email) {
        console.log("Intentando estrategias alternativas de restablecimiento");
        
        // 1. Intentar solicitar un nuevo restablecimiento y luego actualizar
        try {
          console.log("Solicitando nuevo enlace de restablecimiento");
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/password-reset",
          });
          
          if (resetError) {
            console.error("Error al solicitar nuevo restablecimiento:", resetError);
          } else {
            // 2. Intentar actualizar inmediatamente después del reset
            console.log("Intentando actualizar contraseña después de solicitar reset");
            const { error: updateError } = await supabase.auth.updateUser({
              password: password
            });
            
            if (!updateError) {
              // Éxito - la contraseña se actualizó correctamente
              toast.success("¡Tu contraseña ha sido actualizada correctamente!");
              setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
              setTimeout(() => {
                navigate("/auth");
              }, 2000);
              return;
            } else {
              console.error("Error en actualización después de reset:", updateError);
            }
          }
        } catch (err) {
          console.error("Error en estrategia de reset:", err);
        }
        
        // Si llegamos aquí, todos los intentos han fallado
        throw new Error("El enlace de recuperación ha expirado y no se pudo establecer una nueva sesión");
      }
      
      // Si no tenemos ni sesión ni código, algo está mal
      throw new Error("No se pudo establecer una sesión válida para actualizar la contraseña");
      
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      
      if (err.message && (
          err.message.includes("Token has expired") || 
          err.message.includes("recovery link has expired") ||
          err.message.includes("enlace de recuperación ha expirado")
      )) {
        setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
      } else if (err.message && err.message.includes("User not found")) {
        setError("No se encontró ninguna cuenta con este correo electrónico. Por favor verifica e intenta de nuevo.");
      } else if (err.message && err.message.includes("Auth session missing")) {
        setError("No se pudo establecer una sesión de autenticación. Por favor solicita un nuevo enlace de recuperación.");
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
