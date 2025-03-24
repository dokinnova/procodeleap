
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AuthFormWrapper = () => {
  const { toast: toastUI } = useToast();
  const navigate = useNavigate();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [view, setView] = useState<"sign_in" | "forgotten_password">("sign_in");
  const [loginAttempts, setLoginAttempts] = useState(0);
  
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
      
      // Fix: Use sonner toast with correct props
      toast.error(message);
      
      // Clear error parameters from URL
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  // Handle auth events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthFormWrapper: Auth event:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User has signed in');
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Redirecting to password recovery page');
        navigate('/reset-password', { replace: true });
      } else if (event === 'USER_UPDATED') {
        console.log('User has been updated');
        // Fix: Use sonner toast correctly
        toast.success("Tu información ha sido actualizada correctamente");
      }
      
      // Handle login errors by counting attempts
      if (event === 'SIGNED_OUT') {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Login attempt ${newAttempts}`);
          
          // After 3 failed attempts, suggest password reset
          if (newAttempts >= 3) {
            // Fix: Use sonner toast with correct props
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

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center min-h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleView = () => {
    setView(view === "sign_in" ? "forgotten_password" : "sign_in");
  };

  return (
    <div className="auth-form-container">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#0f172a',
                brandAccent: '#1e293b',
              }
            }
          },
          className: {
            container: 'w-full',
            button: 'w-full',
            input: 'rounded-md',
            message: 'text-sm text-red-600 mb-4'
          }
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Correo electrónico',
              password_label: 'Contraseña',
              email_input_placeholder: 'Tu correo electrónico',
              password_input_placeholder: 'Tu contraseña',
              button_label: 'Iniciar sesión',
              loading_button_label: 'Iniciando sesión...',
              social_provider_text: 'Iniciar sesión con {{provider}}',
              link_text: '¿Ya tienes una cuenta? Inicia sesión'
            },
            forgotten_password: {
              email_label: 'Correo electrónico',
              password_label: 'Contraseña',
              email_input_placeholder: 'Tu correo electrónico',
              button_label: 'Enviar instrucciones',
              loading_button_label: 'Enviando instrucciones...',
              link_text: '¿Olvidaste tu contraseña?',
              confirmation_text: 'Revisa tu correo electrónico para obtener el enlace de recuperación'
            }
          }
        }}
        theme="light"
        providers={[]}
        redirectTo={redirectTo}
        view={view}
        showLinks={false}
        magicLink={false}
        socialLayout="horizontal"
      />

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
