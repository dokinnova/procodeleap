
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
      
      // Use current site URL as the base URL for redirects
      const baseUrl = window.location.origin;
      // Use the password-reset page as the redirect destination
      const redirectUrl = `${baseUrl}/password-reset`;
      
      console.log("URL de redirección configurada:", redirectUrl);
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (resetError) {
        throw resetError;
      }
      
      console.log("Solicitud enviada exitosamente");
      toast.success("Se ha enviado un enlace de recuperación a tu correo");
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y spam.");
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento:", err);
      
      if (err.message && err.message.includes("rate limit")) {
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
