
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AuthLogo } from "@/components/auth/components/AuthLogo";
import { AuthContainer } from "@/components/auth/components/AuthContainer";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { PasswordRequestForm } from "@/components/auth/password-reset/PasswordRequestForm";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { ErrorMessage } from "@/components/auth/password-reset/ErrorMessage";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";

const PasswordReset = () => {
  const {
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
    handleRequestPasswordReset,
    handleUpdatePassword,
    searchParams,
    navigate,
    isTokenValid,
    tokenChecked,
    forceRequestMode
  } = usePasswordReset();

  // Determine if we need to show the email field in the reset form
  // This is needed when we have a code but no email-to-token verification
  const showEmailField = mode === "reset" && 
                         searchParams.get("code") && 
                         !searchParams.get("token") &&
                         !searchParams.get("email");
  
  // Log the current state for debugging
  useEffect(() => {
    console.log("Password Reset Page State:", {
      mode,
      tokenChecked,
      isTokenValid,
      forceRequestMode,
      error,
      success,
      email,
      params: {
        code: searchParams.get("code"),
        token: searchParams.get("token"),
        type: searchParams.get("type"),
        email: searchParams.get("email"),
        error: searchParams.get("error"),
        error_description: searchParams.get("error_description")
      }
    });
  }, [mode, tokenChecked, isTokenValid, forceRequestMode, error, success, email, searchParams]);

  // Show loading indicator while checking token validity
  if (!tokenChecked) {
    return (
      <AuthContainer>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Verificando enlace de recuperación...
            </p>
          </CardContent>
        </Card>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <AuthLogo />
          </div>
          <CardTitle className="text-2xl text-center">
            {mode === "request" ? "Recuperar contraseña" : "Crear nueva contraseña"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "request" 
              ? "Ingresa tu correo electrónico para recibir un enlace de recuperación"
              : "Ingresa tu nueva contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorMessage error={error} success={success} />
          
          {mode === "request" ? (
            <PasswordRequestForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleRequestPasswordReset}
            />
          ) : isTokenValid ? (
            <PasswordResetForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              loading={loading}
              onSubmit={handleUpdatePassword}
              showEmailField={showEmailField}
            />
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive" className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  El enlace de recuperación ha expirado o es inválido. Por favor solicita uno nuevo.
                </AlertDescription>
              </Alert>
              
              <Button
                variant="default"
                className="w-full gap-2"
                onClick={() => navigate("/password-reset")}
              >
                <RefreshCw className="h-4 w-4" />
                Solicitar un nuevo enlace
              </Button>
              
              {email && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Tu correo registrado: <strong>{email}</strong></p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Volver al inicio de sesión
          </Button>
        </CardFooter>
      </Card>
    </AuthContainer>
  );
};

export default PasswordReset;
