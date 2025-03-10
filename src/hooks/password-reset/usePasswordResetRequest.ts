
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
      // Get the current origin for building the redirect URL
      const origin = window.location.origin;
      // It's important to use the full path for password-reset
      const redirectTo = `${origin}/password-reset`;
      
      console.log("Solicitando restablecimiento de contraseña para:", email);
      console.log("Redirigiendo a:", redirectTo);
      
      // First try with our custom function
      try {
        const functionResponse = await supabase.functions.invoke("password-reset-notification", {
          body: { email, resetLink: redirectTo }
        });
        
        console.log("Respuesta de función de restablecimiento:", functionResponse);
        
        if (functionResponse.error) {
          throw new Error(functionResponse.error);
        }

        if (!functionResponse.data.success) {
          throw new Error(functionResponse.data.error || "Error al enviar el correo de recuperación");
        }
        
        console.log("Correo enviado a través de la función personalizada");
        toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
        setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y spam.");
        return;
      } catch (funcError) {
        console.warn("Error con la función personalizada, usando método estándar:", funcError);
        
        // Fallback to standard Supabase method
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo,
        });
        
        if (error) {
          throw error;
        }
        
        console.log("Solicitud de restablecimiento enviada con éxito mediante método estándar");
        toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
        setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y spam.");
      }
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
