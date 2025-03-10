
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar errores en la URL
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error && errorDescription) {
      toast({
        title: "Error de autenticación",
        description: errorDescription.replace(/\+/g, ' '),
        variant: "destructive",
      });
      
      navigate('/auth', { replace: true });
      return;
    }
    
    // Verificar flujo de recuperación de contraseña
    const code = url.searchParams.get('code');
    const type = url.searchParams.get('type');
    
    if (type === 'recovery' || code) {
      navigate('/reset-password', { 
        replace: true, 
        state: { code, type } 
      });
      return;
    }
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (location.pathname === '/auth') {
          navigate('/', { replace: true });
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  return <>{children}</>;
};
