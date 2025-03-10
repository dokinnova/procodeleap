
import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const AuthFormWrapper = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const redirectTo = `${window.location.origin}/auth/callback`;

  // Handle "Forgot password" navigation via useEffect instead of onViewChange
  useEffect(() => {
    // Add event listener for Auth UI view changes
    const handleViewChange = (event: CustomEvent<{ view: string }>) => {
      if (event.detail.view === 'forgotten_password') {
        navigate('/password-reset');
      }
    };

    // Listen for view change events from Auth UI
    document.addEventListener('supabaseAuthViewChange', handleViewChange as EventListener);

    return () => {
      document.removeEventListener('supabaseAuthViewChange', handleViewChange as EventListener);
    };
  }, [navigate]);

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
            confirmation_text: 'Revisa tu correo para el enlace de recuperación de contraseña'
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
