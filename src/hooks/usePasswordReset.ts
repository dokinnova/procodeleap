
import { usePasswordResetRequest } from "./password-reset/usePasswordResetRequest";
import { usePasswordUpdate } from "./password-reset/usePasswordUpdate";
import { usePasswordResetMode } from "./password-reset/usePasswordResetMode";

export const usePasswordReset = () => {
  const {
    mode,
    error: modeError,
    setError: setModeError,
    success: modeSuccess,
    setSuccess: setModeSuccess,
    session,
    setSession,
    isTokenValid
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

  // Combine state
  const email = mode === "request" ? requestEmail : updateEmail;
  const setEmail = mode === "request" ? setRequestEmail : setUpdateEmail;
  const loading = mode === "request" ? requestLoading : updateLoading;
  const error = modeError || (mode === "request" ? requestError : updateError);
  const success = modeSuccess || (mode === "request" ? requestSuccess : updateSuccess);

  // Ensure session is properly synced between hooks
  if (typeof usePasswordUpdate["setSession"] === 'function') {
    usePasswordUpdate["setSession"](session);
  }

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
    verificationAttempted,
    setVerificationAttempted,
    handleRequestPasswordReset,
    handleUpdatePassword,
    searchParams,
    navigate
  };
};
