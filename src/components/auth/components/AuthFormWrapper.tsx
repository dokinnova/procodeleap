
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthFormWrapper = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const redirectTo = `${window.location.origin}/auth/callback`;

  // Detectar errores en la URL al cargar el componente
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

  // Manejar errores durante la autenticación
  useEffect(() => {
    const authErrorHandler = (error: any) => {
      console.error('Error de autenticación:', error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error durante la autenticación",
        variant: "destructive",
      });
    };

    // Suscribirse al evento de error de autenticación
    const { data: { subscription } } = supabase.auth.onError(authErrorHandler);

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
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
            link_text: ''
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
            link_text: '',
            email_label: '',
            password_label: '',
            button_label: '',
            loading_button_label: '',
            social_provider_text: '',
            confirmation_text: ''
          }
        }
      }}
      theme="light"
      providers={[]}
      redirectTo={redirectTo}
      view="sign_in"
      showLinks={true}
    />
  );
};
