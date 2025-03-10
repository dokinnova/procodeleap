
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AuthLogo } from "@/components/auth/components/AuthLogo";
import { AuthContainer } from "@/components/auth/components/AuthContainer";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { PasswordRequestForm } from "@/components/auth/password-reset/PasswordRequestForm";
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";
import { ErrorMessage } from "@/components/auth/password-reset/ErrorMessage";
import { Loader2 } from "lucide-react";

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
    tokenChecked
  } = usePasswordReset();

  // Determine if we need to show the email field in the reset form
  // This is needed when we have a code but no email-to-token verification
  const showEmailField = mode === "reset" && 
                         searchParams.get("code") && 
                         !searchParams.get("token");

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
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">El enlace de recuperación es inválido o ha expirado.</p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate("/password-reset")}
              >
                Solicitar un nuevo enlace
              </Button>
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
