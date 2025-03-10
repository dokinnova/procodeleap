
import { supabase } from "@/integrations/supabase/client";

export const useOtpCodeVerifier = () => {
  const verifyCodeWithEmail = async (code: string, email: string) => {
    console.log("Verificando código de recuperación:", code, "para email:", email);
    
    try {
      // Try to verify the OTP directly with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error("Error al intercambiar código por sesión:", verifyError);
        throw verifyError;
      }
      
      console.log("Código intercambiado exitosamente por sesión:", data?.session ? "Sesión presente" : "Sin sesión");
      return { 
        success: true, 
        session: data?.session 
      };
    } catch (err) {
      console.error("Error en verificación directa:", err);
      return { 
        success: false, 
        error: err 
      };
    }
  };

  return {
    verifyCodeWithEmail
  };
};
