
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthFormWrapper = () => {
  const { toast } = useToast();
  const redirectTo = `${window.location.origin}/auth/callback`;

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
            // Remove link_text to hide the sign-up link
          },
          sign_up: {
            email_label: 'Correo electrónico',
            password_label: 'Contraseña',
            email_input_placeholder: 'Tu correo electrónico',
            password_input_placeholder: 'Tu contraseña',
            button_label: 'Registrarse',
            loading_button_label: 'Registrando...',
            social_provider_text: 'Registrarse con {{provider}}',
            // Remove link_text to hide the sign-in link
          },
          forgotten_password: {
            email_label: 'Correo electrónico',
            password_label: 'Contraseña',
            email_input_placeholder: 'Tu correo electrónico',
            button_label: 'Enviar instrucciones',
            loading_button_label: 'Enviando instrucciones...',
            link_text: '¿Olvidaste tu contraseña?',
          }
        },
      }}
      theme="light"
      providers={[]}
      redirectTo={redirectTo}
      // Hide sign up view to only allow sign in
      view="sign_in"
      // Disable sign up feature
      disableSignUp={true}
    />
  );
};
