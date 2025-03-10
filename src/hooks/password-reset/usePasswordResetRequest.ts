
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
      console.log("Solicitando restablecimiento para:", email);
      
      // Usar la URL actual (no la de vercel) para la redirección
      const currentUrl = window.location.href;
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/password-reset`;
      
      console.log("URL actual:", currentUrl);
      console.log("URL base:", baseUrl);
      console.log("URL de redirección configurada:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) throw error;
      
      console.log("Solicitud enviada exitosamente");
      toast.success("Se ha enviado un enlace de recuperación a tu correo");
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y spam.");
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento:", err);
      
      if (err.message && err.message.includes("User not found")) {
        setError("No se encontró ninguna cuenta con este correo. Por favor verifica e intenta de nuevo.");
      } else if (err.message && err.message.includes("rate limit")) {
        setError("Has solicitado demasiados enlaces. Por favor espera unos minutos antes de intentarlo de nuevo.");
      } else {
        setError("Ocurrió un error al solicitar el restablecimiento. Por favor intenta de nuevo más tarde.");
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
