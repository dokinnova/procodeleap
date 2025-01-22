import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const AuthForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already logged in, redirecting to home");
        navigate('/');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && session) {
        console.log("Auth state changed - user logged in, redirecting to home");
        navigate('/');
      } else if (_event === 'USER_UPDATED') {
        console.log("Auth state changed - user updated");
      } else if (_event === 'SIGNED_OUT') {
        console.log("Auth state changed - user signed out");
      } else {
        console.log("Auth state changed:", _event);
        if (!session) {
          toast({
            title: "Error de autenticación",
            description: "Hubo un problema al autenticar. Por favor intenta de nuevo.",
            variant: "destructive",
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {siteSettings?.logo_url && (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center p-4">
                  <img
                    src={siteSettings.logo_url}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
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
                    link_text: '¿Ya tienes una cuenta? Inicia sesión',
                  },
                  sign_up: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    email_input_placeholder: 'Tu correo electrónico',
                    password_input_placeholder: 'Tu contraseña',
                    button_label: 'Registrarse',
                    loading_button_label: 'Registrando...',
                    social_provider_text: 'Registrarse con {{provider}}',
                    link_text: '¿No tienes una cuenta? Regístrate',
                  },
                  forgotten_password: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    email_input_placeholder: 'Tu correo electrónico',
                    button_label: 'Enviar instrucciones',
                    loading_button_label: 'Enviando instrucciones...',
                    link_text: '¿Olvidaste tu contraseña?',
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </CardContent>
        </Card>
      </div>
      <footer className="text-center py-4 text-sm text-gray-500">
        Desarrollado por Adapta © {currentYear}
      </footer>
    </div>
  );
};