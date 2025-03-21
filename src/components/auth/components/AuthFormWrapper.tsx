
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthFormWrapper = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  // Usar window.location.origin para obtener el dominio actual
  const currentUrl = window.location.origin;
  // URL de redirección simplificada que funciona en todos los dominios
  const redirectTo = `${currentUrl}/reset-password`;
  
  console.log("AuthFormWrapper: Usando URL de redirección:", redirectTo);

  // Verificar si hay una sesión activa al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("AuthFormWrapper: Sesión activa encontrada, redirigiendo a inicio");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    checkSession();
  }, [navigate]);

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
        // No mostrar este mensaje, lo dejamos al AuthProvider
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

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center items-center min-h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        view="sign_in"
        showLinks={true}
        // Ocultar las opciones que permiten registrarse
        magicLink={false}
        socialLayout="horizontal"
        // Desactiva la creación de nuevas cuentas
        disableSignUp={true}
      />
    </div>
  );
};
