
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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRecoveringManuel, setIsRecoveringManuel] = useState(false);
  
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
        console.log('Usuario ha iniciado sesión');
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Redirigiendo a la página de recuperación de contraseña');
        navigate('/reset-password', { replace: true });
      } else if (event === 'USER_UPDATED') {
        console.log('La información del usuario ha sido actualizada');
        toast.success("Tu información ha sido actualizada correctamente");
      }
      
      // Handle login errors by counting attempts
      if (event === 'SIGNED_OUT') {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Intento de inicio de sesión ${newAttempts}`);
          
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
    setIsLoggingIn(true);
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setLoginError("Por favor ingresa tu correo electrónico y contraseña");
      setIsLoggingIn(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Error de inicio de sesión manual:", error);
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Credenciales de inicio de sesión inválidas. Verifica tu correo y contraseña o usa la opción 'Olvidé mi contraseña'.");
          toast.error("Credenciales de inicio de sesión inválidas");
        } else {
          setLoginError(error.message);
          toast.error(`Error de inicio de sesión: ${error.message}`);
        }
      } else {
        console.log("Inicio de sesión manual exitoso:", data);
        toast.success("Inicio de sesión exitoso");
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error("Error inesperado durante el inicio de sesión:", err);
      setLoginError(err.message);
      toast.error(`Error inesperado: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
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
        console.error("Error al enviar email de recuperación:", error);
        setLoginError(`Error al enviar el email de recuperación: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success("Email de recuperación enviado. Por favor, revisa tu bandeja de entrada.");
        setView("sign_in");
        setLoginError(null);
      }
    } catch (err: any) {
      console.error("Error inesperado durante la recuperación:", err);
      setLoginError(err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  // Función especial para recuperar directamente la cuenta de Manuel
  const handleManuelRecovery = async () => {
    const manuelEmail = "manuelalegrec@gmail.com";
    setIsRecoveringManuel(true);
    setLoginError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(manuelEmail, {
        redirectTo: redirectTo
      });
      
      if (error) {
        console.error("Error al enviar email de recuperación para Manuel:", error);
        setLoginError(`Error al enviar el email de recuperación: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success("Email de recuperación enviado a manuelalegrec@gmail.com. Por favor, revisa la bandeja de entrada.");
      }
    } catch (err: any) {
      console.error("Error inesperado durante la recuperación:", err);
      setLoginError(err.message);
    } finally {
      setIsRecoveringManuel(false);
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
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Botón para recuperación directa de la cuenta de Manuel */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="text-sm font-semibold text-amber-800">Recuperación para manuelalegrec@gmail.com</h3>
            <p className="text-xs text-amber-700 mb-2">
              Si eres Manuel y tienes problemas para iniciar sesión, puedes enviar un correo de recuperación directamente.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManuelRecovery}
              disabled={isRecoveringManuel}
              className="w-full text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              {isRecoveringManuel ? "Enviando..." : "Enviar correo de recuperación"}
            </Button>
          </div>
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
