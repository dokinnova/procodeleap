
import { usePasswordResetRequest } from "./password-reset/usePasswordResetRequest";
import { usePasswordUpdate } from "./password-reset/usePasswordUpdate";
import { usePasswordResetMode } from "./password-reset/usePasswordResetMode";
import { useState, useEffect } from "react";

export const usePasswordReset = () => {
  const {
    mode,
    error: modeError,
    setError: setModeError,
    success: modeSuccess,
    setSuccess: setModeSuccess,
    session,
    setSession,
    isTokenValid,
    tokenChecked,
    forceRequestMode
  } = usePasswordResetMode();

  const {
    email: requestEmail,
    setEmail: setRequestEmail,
    loading: requestLoading,
    error: requestError,
    success: requestSuccess,
    handleRequestPasswordReset
  } = usePasswordResetRequest();

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email: updateEmail,
    setEmail: setUpdateEmail,
    loading: updateLoading,
    error: updateError,
    success: updateSuccess,
    verificationAttempted,
    setVerificationAttempted,
    handleUpdatePassword,
    searchParams,
    navigate
  } = usePasswordUpdate();

  // Sincronizar email entre los modos de solicitud y reset
  useEffect(() => {
    if (mode === "request" && updateEmail) {
      console.log("Sincronizando email de modo reset a request:", updateEmail);
      setRequestEmail(updateEmail);
    } else if (mode === "reset" && requestEmail) {
      console.log("Sincronizando email de modo request a reset:", requestEmail);
      setUpdateEmail(requestEmail);
    }
  }, [mode, requestEmail, updateEmail, setRequestEmail, setUpdateEmail]);

  // Limpiar errores a nivel de modo cuando cambia el modo
  useEffect(() => {
    setModeError(null);
    setModeSuccess(null);
  }, [mode, setModeError, setModeSuccess]);

  // Manejar navegación forzada cuando el token es inválido
  useEffect(() => {
    if (mode === "reset" && tokenChecked && !isTokenValid && !forceRequestMode) {
      console.log("Token inválido detectado, redirigiendo a solicitud de reset");
      navigate("/password-reset");
    }
  }, [mode, tokenChecked, isTokenValid, forceRequestMode, navigate]);

  // Seleccionar el estado apropiado basado en el modo
  const email = mode === "request" ? requestEmail : updateEmail;
  const setEmail = mode === "request" ? setRequestEmail : setUpdateEmail;
  const loading = mode === "request" ? requestLoading : updateLoading;
  const error = modeError || (mode === "request" ? requestError : updateError);
  const success = modeSuccess || (mode === "request" ? requestSuccess : updateSuccess);

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    session,
    isTokenValid,
    tokenChecked,
    verificationAttempted,
    setVerificationAttempted,
    handleRequestPasswordReset,
    handleUpdatePassword,
    searchParams,
    navigate,
    setError: setModeError,
    setSuccess: setModeSuccess,
    forceRequestMode
  };
};
