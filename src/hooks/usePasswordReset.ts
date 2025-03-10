
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

  // Sync email between request and reset modes
  useEffect(() => {
    if (mode === "request" && updateEmail) {
      console.log("Sincronizando email de modo reset a request:", updateEmail);
      setRequestEmail(updateEmail);
    } else if (mode === "reset" && requestEmail) {
      console.log("Sincronizando email de modo request a reset:", requestEmail);
      setUpdateEmail(requestEmail);
    }
  }, [mode, requestEmail, updateEmail, setRequestEmail, setUpdateEmail]);

  // Clear mode-level errors when mode changes
  useEffect(() => {
    setModeError(null);
    setModeSuccess(null);
  }, [mode, setModeError, setModeSuccess]);

  // Handle forced navigation when token is invalid
  useEffect(() => {
    if (mode === "reset" && tokenChecked && !isTokenValid && !forceRequestMode) {
      console.log("Token inválido detectado, redirigiendo a solicitud de reset");
      navigate("/password-reset");
    }
  }, [mode, tokenChecked, isTokenValid, forceRequestMode, navigate]);

  // Select appropriate email, loading and error state based on mode
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
