
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
      
      // Determinar la URL de origen adecuada
      // Priorizar la URL de Vercel en producción para garantizar que los enlaces funcionen
      const isVercelProduction = window.location.origin.includes("vercel.app") || 
                               window.location.origin.includes("makipura.com");
      
      // Usar preferentemente la URL de Vercel para garantizar consistencia
      const baseUrl = isVercelProduction 
        ? "https://procodeli-makipurays-projects.vercel.app" 
        : window.location.origin;
      
      // Configurar la URL de redirección con la ruta de callback correcta
      const redirectUrl = `${baseUrl}/auth/callback`;
      
      console.log("URL de origen detectada:", baseUrl);
      console.log("URL de redirección configurada:", redirectUrl);
      
      // Intentar el método nativo de Supabase primero
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (resetError) {
        console.error("Error con método nativo:", resetError);
        
        // Si falla, intentar con nuestra función personalizada
        console.log("Intentando con función personalizada");
        const { data, error: functionError } = await supabase.functions.invoke("password-reset-notification", {
          body: { 
            email, 
            resetLink: redirectUrl
          }
        });
        
        if (functionError) throw functionError;
        
        if (!data.success) {
          throw new Error(data.error || "Error al enviar el correo de recuperación");
        }
      }
      
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
