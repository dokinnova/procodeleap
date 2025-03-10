
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordResetSession = () => {
  const [searchParams] = useSearchParams();
  const [sessionEstablished, setSessionEstablished] = useState(false);
  
  // Extract email and code from URL parameters
  const emailParam = searchParams.get("email");
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  
  // Attempt to verify OTP and establish session
  useEffect(() => {
    const attemptInitialVerification = async () => {
      if (code && type === "recovery" && emailParam && !sessionEstablished) {
        console.log("Intentando verificación inicial de OTP");
        
        try {
          // Verify the OTP directly
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email: emailParam,
            token: code,
            type: 'recovery'
          });
          
          if (verifyError) {
            console.error("Error en verificación inicial:", verifyError);
          } else if (data?.session) {
            console.log("Verificación inicial exitosa, sesión establecida");
            setSessionEstablished(true);
          }
        } catch (err) {
          console.error("Error en verificación inicial:", err);
        }
      }
    };
    
    attemptInitialVerification();
  }, [code, type, emailParam, sessionEstablished]);
  
  return {
    sessionEstablished,
    setSessionEstablished
  };
};
