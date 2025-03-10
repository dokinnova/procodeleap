
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
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if we have a token or code in the URL parameters
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    
    if (token || code) {
      setMode("reset");
      
      // If we have a code from Supabase but not a token, handle that scenario
      if (code && !token) {
        const handleSupabaseCode = async () => {
          try {
            // Check if we already have a session (user is already authenticated)
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              // User is already authenticated, we can proceed with password reset
              setSession(currentSession);
              return;
            }
            
            // If no valid email is provided with the code, we can't verify the OTP
            // The user will need to enter their email to continue
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
    
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
      // Don't navigate away, just show a success message
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento de contraseña:", err);
      setError(err.message || "Error al solicitar restablecimiento de contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
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
      // Check if we have a code from the URL
      const code = searchParams.get("code");
      
      // If we have a code and email but no session, we need to verify the OTP first
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
      
      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Contraseña actualizada correctamente");
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      setError(err.message || "Error al actualizar contraseña");
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
    session,
    handleRequestPasswordReset,
    handleUpdatePassword,
    searchParams,
    navigate
  };
};
