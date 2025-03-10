
import { useResetFormSubmit } from "./useResetFormSubmit";
import { usePasswordResetSession } from "./usePasswordResetSession";

export const usePasswordUpdate = () => {
  const {
    sessionEstablished
  } = usePasswordResetSession();
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    verificationAttempted,
    setVerificationAttempted,
    handleUpdatePassword,
    searchParams,
    navigate
  } = useResetFormSubmit();
  
  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
    loading,
    error,
    success,
    verificationAttempted,
    setVerificationAttempted,
    handleUpdatePassword,
    searchParams,
    navigate,
    sessionEstablished
  };
};
