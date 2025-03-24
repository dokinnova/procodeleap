
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AuthFormWrapper = () => {
  const { toast: toastUI } = useToast();
  const navigate = useNavigate();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [view, setView] = useState<"sign_in" | "forgotten_password">("sign_in");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  
  // Using window.location.origin for getting the current domain
  const currentUrl = window.location.origin;
  // Simplified redirect URL that works on all domains
  const redirectTo = `${currentUrl}/reset-password`;
  
  console.log("AuthFormWrapper: Using redirect URL:", redirectTo);

  // Check for active session when component loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("AuthFormWrapper: Active session found, redirecting to home");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Detect errors in URL when component loads
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorCode = url.searchParams.get('error_code');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error && errorDescription) {
      console.log('AuthFormWrapper: Error detected:', error, errorCode, errorDescription);
      
      let message = errorDescription.replace(/\+/g, ' ');
      if (errorCode === 'otp_expired') {
        message = "El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.";
      }
      
      toast.error(message);
      
      // Clear error parameters from URL
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  // Handle auth events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthFormWrapper: Auth event:', event);
      
      // Clear login error on any auth event
      setLoginError(null);
      
      if (event === 'SIGNED_IN') {
        console.log('User has signed in');
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Redirecting to password recovery page');
        navigate('/reset-password', { replace: true });
      } else if (event === 'USER_UPDATED') {
        console.log('User has been updated');
        toast.success("Tu información ha sido actualizada correctamente");
      }
      
      // Handle login errors by counting attempts
      if (event === 'SIGNED_OUT') {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Login attempt ${newAttempts}`);
          
          // After 3 failed attempts, suggest password reset
          if (newAttempts >= 3) {
            toast.info("¿Olvidaste tu contraseña? Utiliza la opción 'Olvidé mi contraseña' para recuperar tu cuenta.", {
              duration: 6000,
            });
          }
          return newAttempts;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Manual login function
  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setLoginError("Por favor ingresa tu correo electrónico y contraseña");
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Manual login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Credenciales de inicio de sesión inválidas. Verifica tu correo y contraseña o usa la opción 'Olvidé mi contraseña'.");
          toast.error("Credenciales de inicio de sesión inválidas");
        } else {
          setLoginError(error.message);
          toast.error(`Error de inicio de sesión: ${error.message}`);
        }
      } else {
        console.log("Manual login successful:", data);
        toast.success("Inicio de sesión exitoso");
      }
    } catch (err: any) {
      console.error("Unexpected error during login:", err);
      setLoginError(err.message);
      toast.error(`Error inesperado: ${err.message}`);
    }
  };

  // Password recovery function
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail) {
      setLoginError("Por favor ingresa tu correo electrónico para la recuperación");
      return;
    }
    
    setIsRecovering(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: redirectTo
      });
      
      if (error) {
        console.error("Error sending recovery email:", error);
        setLoginError(`Error al enviar el email de recuperación: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success("Email de recuperación enviado. Por favor, revisa tu bandeja de entrada.");
        setView("sign_in");
        setLoginError(null);
      }
    } catch (err: any) {
      console.error("Unexpected error during recovery:", err);
      setLoginError(err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center min-h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleView = () => {
    setView(view === "sign_in" ? "forgotten_password" : "sign_in");
    setLoginError(null);
  };

  return (
    <div className="auth-form-container">
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      {view === "sign_in" ? (
        <>
          {/* Manual login form */}
          <form onSubmit={handleManualLogin} className="space-y-4 mb-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email" 
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tu correo electrónico"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tu contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </form>
        </>
      ) : (
        <>
          {/* Password recovery form */}
          <form onSubmit={handlePasswordRecovery} className="space-y-4 mb-4">
            <div>
              <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700">
                Correo electrónico para recuperación
              </label>
              <input
                id="recovery-email"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tu correo electrónico"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isRecovering}>
              {isRecovering ? "Enviando..." : "Enviar instrucciones de recuperación"}
            </Button>
          </form>
        </>
      )}

      <div className="mt-4 text-center">
        {view === "sign_in" ? (
          <Button 
            variant="link" 
            className="text-primary"
            onClick={toggleView}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        ) : (
          <Button 
            variant="link" 
            className="text-primary"
            onClick={toggleView}
          >
            Volver a inicio de sesión
          </Button>
        )}
      </div>
    </div>
  );
};
