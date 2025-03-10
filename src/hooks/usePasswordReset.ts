
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
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
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
    
    if (token || code) {
      setMode("reset");
      
      if (code && !token) {
        const handleSupabaseCode = async () => {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              setSession(currentSession);
              return;
            }
            
            toast.info("Por favor ingresa tu correo electrónico para verificar tu identidad");
          } catch (err) {
            console.error("Error al verificar la sesión:", err);
            toast.error("Ocurrió un error al procesar tu solicitud");
            setError("Ocurrió un error al procesar tu solicitud");
          }
        };
        
        handleSupabaseCode();
      }
    } else {
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
      
      if (code && email && !session) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'recovery',
        });
        
        if (verifyError) {
          throw verifyError;
        }
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
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
