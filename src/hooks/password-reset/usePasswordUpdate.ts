
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
    handleUpdatePassword,
    searchParams,
    navigate
  };
};
