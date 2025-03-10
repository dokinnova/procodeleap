
import { supabase } from "@/integrations/supabase/client";

export const useTokenVerification = () => {
  const verifySession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    
    console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
    return { hasSession: !!currentSession, session: currentSession };
  };
  
  const verifyCodeWithEmail = async (code: string, email: string) => {
    console.log("Verificando OTP para email:", email, "con código:", code);
    
    try {
      // Try to verify the OTP directly with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al verificar OTP directamente:", verifyError);
        throw verifyError;
      }
      
      console.log("Verificación OTP exitosa directamente:", data?.session ? "Sesión presente" : "Sin sesión");
      return { success: true, session: data?.session };
    } catch (err) {
      console.error("Error en verificación directa:", err);
      return { success: false, error: err };
    }
  };
  
  return {
    verifySession,
    verifyCodeWithEmail
  };
};
