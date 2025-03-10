
import { supabase } from "@/integrations/supabase/client";

export const useTokenValidation = () => {
  const verifySession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    
    console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
    return { hasSession: !!currentSession, session: currentSession };
  };
  
  const verifyCodeWithEmail = async (code: string, email: string) => {
    console.log("Verificando código de recuperación para:", email);
    
    try {
      // Try to verify the code with Supabase's built-in method
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al verificar código:", verifyError);
        throw verifyError;
      }
      
      console.log("Verificación exitosa:", data?.session ? "Sesión establecida" : "Sin sesión");
      return { success: true, session: data?.session };
    } catch (err) {
      console.error("Error en verificación:", err);
      return { success: false, error: err };
    }
  };
  
  return {
    verifySession,
    verifyCodeWithEmail
  };
};
