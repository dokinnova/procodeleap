
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Limpiar mensajes de error y éxito al montar el componente
    setError(null);
    setSuccess(null);
    
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    console.log("Token:", token);
    console.log("Code:", code);
    console.log("Type:", type);
    console.log("Error:", errorParam);
    console.log("Error Description:", errorDescription);
    
    if (errorParam && errorDescription) {
      if (errorDescription.includes("expired")) {
        setError("El enlace ha expirado. Por favor solicita un nuevo enlace de recuperación.");
        setMode("request");
        return;
      } else if (errorDescription.includes("Email link")) {
        setError("El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.");
        setMode("request");
        return;
      } else {
        setError(`Error: ${errorDescription}`);
      }
    }
    
    // Si tiene token o código, y no hay error, cambiamos a modo reset
    if ((token || code) && !errorParam) {
      console.log("Estableciendo modo reset");
      setMode("reset");
      
      // Si tiene un código de recuperación pero no un token, verificamos la sesión
      if (code && !token) {
        const handleSupabaseCode = async () => {
          try {
            console.log("Verificando sesión con código");
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              console.log("Sesión encontrada:", currentSession);
              setSession(currentSession);
              return;
            }
            
            // Si no hay sesión, necesitamos el email para verificar el código
            console.log("No hay sesión, solicitando email");
            toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
          } catch (err) {
            console.error("Error al verificar la sesión:", err);
            toast.error("Ocurrió un error al procesar tu solicitud");
            setError("Ocurrió un error al procesar tu solicitud");
          }
        };
        
        handleSupabaseCode();
      }
    } else if (!token && !code) {
      console.log("No hay token ni código, estableciendo modo request");
      setMode("request");
    }
  }, [searchParams]);

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    
    try {
      // Obtenemos el origen actual para construir la URL de redirección
      const origin = window.location.origin;
      const redirectTo = `${origin}/password-reset`;
      
      console.log("Solicitando reset de contraseña para:", email);
      console.log("Redirigiendo a:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.");
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento de contraseña:", err);
      setError("Ocurrió un error al solicitar el restablecimiento de contraseña");
    } finally {
      setLoading(false);
    }
  };

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

    setLoading(true);
    
    try {
      const code = searchParams.get("code");
      
      console.log("Actualizando contraseña");
      console.log("Código:", code);
      console.log("Email:", email);
      console.log("Sesión:", !!session);
      
      // Si tenemos código pero no sesión, primero verificamos el OTP
      if (code && email && !session) {
        console.log("Verificando OTP con email:", email);
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'recovery',
        });
        
        if (verifyError) {
          console.error("Error al verificar OTP:", verifyError);
          throw verifyError;
        }
      }
      
      // Actualizamos la contraseña
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Error al actualizar contraseña:", error);
        throw error;
      }
      
      toast.success("¡Tu contraseña ha sido actualizada correctamente!");
      setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      
      if (err.message && err.message.includes("Token has expired")) {
        setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
      } else {
        setError("Ocurrió un error al actualizar la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    session,
    handleRequestPasswordReset,
    handleUpdatePassword,
    searchParams,
    navigate
  };
};
