
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useTokenValidator } from "./useTokenValidator";

export const useTokenValidation = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [forceRequestMode, setForceRequestMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const {
    validateToken: tokenValidate,
    verifySession,
    verifyCodeWithEmail,
    setSession: setValidatorSession
  } = useTokenValidator();

  // Actualizar el estado local cuando cambie la sesión en el validator
  const setLocalSession = (newSession: Session | null) => {
    setSession(newSession);
    setValidatorSession(newSession);
    if (newSession) {
      setIsTokenValid(true);
    }
  };

  // Función para verificar sesión que actualiza el estado local
  const verifyCurrentSession = async () => {
    const result = await verifySession();
    if (result.session) {
      setLocalSession(result.session);
    }
    return result;
  };

  // Función para verificar código con email que actualiza el estado local
  const verifyCodeWithEmailAndUpdateState = async (code: string, email: string) => {
    const result = await verifyCodeWithEmail(code, email);
    if (result.success && result.session) {
      setLocalSession(result.session);
      setIsTokenValid(true);
    }
    return result;
  };

  // Función de validación de token que actualiza el estado local
  const validateToken = async (
    token?: string | null,
    code?: string | null,
    type?: string | null,
    emailParam?: string | null,
    errorParam?: string | null, 
    errorDescription?: string | null,
    accessToken?: string | null,
    refreshToken?: string | null
  ) => {
    const result = await tokenValidate(
      token,
      code,
      type,
      emailParam,
      errorParam,
      errorDescription,
      accessToken,
      refreshToken
    );

    // Actualizar estados locales basados en el resultado
    setTokenChecked(true);
    
    if (result.success) {
      setIsTokenValid(true);
    } else if (result.setRequestMode) {
      setForceRequestMode(true);
    }

    return result;
  };
  
  return {
    verifySession: verifyCurrentSession,
    verifyCodeWithEmail: verifyCodeWithEmailAndUpdateState,
    validateToken,
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession: setLocalSession
  };
};
