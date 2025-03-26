
import { useAuthForm } from "../hooks/useAuthForm";
import { SignInForm } from "./forms/SignInForm";
import { RecoveryForm } from "./forms/RecoveryForm";
import { AuthFormLoading } from "./forms/AuthFormLoading";

export const AuthFormWrapper = () => {
  const { 
    isLoadingInitial,
    view,
    loginError,
    setLoginError,
    setLoginAttempts,
    toggleView
  } = useAuthForm();

  if (isLoadingInitial) {
    return <AuthFormLoading />;
  }

  return (
    <div className="auth-form-container">
      {view === "sign_in" ? (
        <SignInForm 
          onToggleView={toggleView}
          setLoginAttempts={setLoginAttempts}
        />
      ) : (
        <RecoveryForm 
          onToggleView={toggleView}
          setLoginError={setLoginError}
          loginError={loginError}
        />
      )}
    </div>
  );
};
