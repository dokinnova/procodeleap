
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [view, setView] = useState<"sign_in" | "forgotten_password">("sign_in");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Check for existing session on load
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

  // Handle URL error parameters
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
      
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  // Setup auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthFormWrapper: Auth event:', event);
      
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
      
      if (event === 'SIGNED_OUT') {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Intento de inicio de sesión ${newAttempts}`);
          
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

  const toggleView = () => {
    setView(view === "sign_in" ? "forgotten_password" : "sign_in");
    setLoginError(null);
  };

  return {
    isLoadingInitial,
    view,
    loginAttempts,
    loginError,
    setLoginError,
    setLoginAttempts,
    toggleView
  };
};
