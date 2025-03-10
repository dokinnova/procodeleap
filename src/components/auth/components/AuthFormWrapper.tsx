
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthFormWrapper = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Usar window.location.origin para obtener el dominio actual
  const currentUrl = window.location.origin;
  // URL de redirección simplificada que funciona en todos los dominios
  const redirectTo = `${currentUrl}/reset-password`;
  
  console.log("AuthFormWrapper: Usando URL de redirección:", redirectTo);

  // Detectar errores en la URL cuando el componente se carga
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorCode = url.searchParams.get('error_code');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error && errorDescription) {
      console.log('AuthFormWrapper: Error detectado:', error, errorCode, errorDescription);
      
      let message = errorDescription.replace(/\+/g, ' ');
      if (errorCode === 'otp_expired') {
        message = "El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.";
      }
      
      toast({
        title: "Error de autenticación",
        description: message,
        variant: "destructive",
      });
      
      // Limpiar los parámetros de error de la URL
      navigate('/auth', { replace: true });
    }
  }, [toast, navigate]);

  // Manejar eventos de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthFormWrapper: Evento de autenticación:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('Usuario ha iniciado sesión');
        toast({
          title: "Sesión iniciada",
          description: "Has iniciado sesión correctamente.",
        });
        navigate('/', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Redirigiendo a página de recuperación de contraseña');
        // Usar siempre la ruta central de restablecimiento de contraseña
        navigate('/reset-password', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
            },
            sign_up: {
              email_label: 'Correo electrónico',
              password_label: 'Contraseña',
              email_input_placeholder: 'Tu correo electrónico',
              password_input_placeholder: 'Tu contraseña',
              button_label: 'Registrarse',
              loading_button_label: 'Registrando...',
              link_text: '¿No tienes una cuenta? Regístrate',
              confirmation_text: 'Revisa tu correo electrónico para confirmar tu registro'
            }
          }
        }}
        theme="light"
        providers={[]}
        redirectTo={redirectTo}
        view="sign_in"
        showLinks={true}
      />
    </div>
  );
};
