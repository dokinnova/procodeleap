
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokenValidation } from "./useTokenValidation";
import { useResetUrlParams } from "./useResetUrlParams";

export type PasswordResetMode = "request" | "reset";

export const usePasswordResetMode = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<PasswordResetMode>("request");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession,
    validateToken
  } = useTokenValidation();
  
  const { getUrlParams } = useResetUrlParams();

  useEffect(() => {
    const checkTokenValidity = async () => {
      setError(null);
      setSuccess(null);
      
      const {
        token,
        code,
        type,
        emailParam,
        errorParam,
        errorDescription,
        accessToken,
        refreshToken
      } = getUrlParams();
      
      const validationResult = await validateToken(
        token,
        code,
        type,
        emailParam,
        errorParam,
        errorDescription,
        accessToken,
        refreshToken
      );

      if (validationResult.error) {
        setError(validationResult.error);
        setMode("request");
      } else if (validationResult.setRequestMode) {
        setMode("request");
      } else if (validationResult.success) {
        setMode("reset");
      }
    };
    
    checkTokenValidity();
  }, [navigate]);

  return {
    mode,
    error,
    setError,
    success,
    setSuccess,
    session,
    setSession,
    isTokenValid,
    tokenChecked,
    forceRequestMode
  };
};
