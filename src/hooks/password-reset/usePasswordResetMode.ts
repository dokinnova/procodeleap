
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
    validateToken,
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession
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

      console.log("Iniciando validación de token/código en página de reset");
      
      // Si tenemos un código o token, intentamos validarlo
      if (token || code || accessToken || refreshToken) {
        console.log("Token o código detectado, intentando validación...");
        
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
          console.error("Error en validación:", validationResult.error);
          setError(validationResult.error);
          setMode("request");
        } else if (validationResult.setRequestMode) {
          console.log("Configurando modo solicitud");
          setMode("request");
        } else if (validationResult.success) {
          console.log("Validación exitosa, configurando modo reset");
          setMode("reset");
        }
      } else {
        console.log("No se detectó token o código, modo solicitud por defecto");
        setMode("request");
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
