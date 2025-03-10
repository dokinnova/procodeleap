
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordResetRequest = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      // Es importante usar la ruta completa para password-reset
      const redirectTo = `${origin}/password-reset`;
      
      console.log("Solicitando reset de contraseña para:", email);
      console.log("Redirigiendo a:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Solicitud de reseteo enviada exitosamente, revise su correo");
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y spam.");
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento de contraseña:", err);
      
      if (err.message && err.message.includes("User not found")) {
        setError("No se encontró ninguna cuenta con este correo electrónico. Por favor verifica e intenta de nuevo.");
      } else if (err.message && err.message.includes("rate limit")) {
        setError("Has solicitado demasiados enlaces de recuperación. Por favor espera unos minutos antes de intentarlo de nuevo.");
      } else {
        setError("Ocurrió un error al solicitar el restablecimiento de contraseña. Por favor intenta de nuevo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    success,
    handleRequestPasswordReset
  };
};
