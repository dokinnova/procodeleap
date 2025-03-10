
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
      console.log("Verificación intentada previamente:", verificationAttempted);
      
      // Si tenemos código pero no sesión, primero verificamos el OTP
      if (code && email && !session && !verificationAttempted) {
        console.log("Verificando OTP con email:", email);
        setVerificationAttempted(true);
        
        const { error: verifyError, data } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'recovery',
        });
        
        if (verifyError) {
          console.error("Error al verificar OTP:", verifyError);
          // Intentamos actualizar la contraseña directamente en caso de que
          // el error sea solo en la verificación pero el token aún funcione
          console.log("Intentando actualizar la contraseña directamente...");
        } else {
          console.log("OTP verificado exitosamente, datos recibidos:", data);
        }
      }
      
      // Actualizamos la contraseña (intentamos incluso si la verificación falló,
      // ya que puede funcionar directamente con el token en la URL)
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
