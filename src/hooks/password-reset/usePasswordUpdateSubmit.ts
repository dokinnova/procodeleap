
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordUpdateSubmit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const updatePassword = async (password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Actualizando contraseña");
      
      // Verificamos si tenemos una sesión activa
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sesión activa al actualizar contraseña:", sessionData?.session ? "Presente" : "Ausente");
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error("Error al actualizar contraseña:", updateError);
        
        if (updateError.message && (
          updateError.message.includes("Auth session missing") ||
          updateError.message.includes("JWT") ||
          updateError.message.includes("expired") ||
          updateError.message.includes("invalid") ||
          updateError.message.includes("not found")
        )) {
          throw new Error("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
        }
        
        throw updateError;
      }
      
      console.log("Contraseña actualizada exitosamente");
      toast.success("¡Tu contraseña ha sido actualizada correctamente!");
      setSuccess("¡Tu contraseña ha sido actualizada correctamente! Serás redirigido al inicio de sesión.");
      return true;
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      
      if (err.message && (
        err.message.includes("expired") || 
        err.message.includes("El enlace de recuperación ha expirado") ||
        err.message.includes("not found") ||
        err.message.includes("invalid") ||
        err.message.includes("Invalid") ||
        err.message.includes("Auth session missing") ||
        err.message.includes("JWT")
      )) {
        setError("El enlace de recuperación ha expirado. Por favor solicita uno nuevo.");
      } else if (err.message && err.message.includes("User not found")) {
        setError("No se encontró ninguna cuenta con este correo electrónico. Por favor verifica e intenta de nuevo.");
      } else {
        setError(`Ocurrió un error al actualizar la contraseña: ${err.message || "Error desconocido"}`);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    success,
    setError,
    setSuccess,
    updatePassword
  };
};
