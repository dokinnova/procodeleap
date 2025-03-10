
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./AuthForm";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    console.log('ProtectedRoute: Verificando sesión...');
    
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error al verificar sesión:', error);
          setSession(null);
          uiToast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión de nuevo.",
            variant: "destructive",
          });
        } else if (!currentSession) {
          console.log('ProtectedRoute: No se encontró sesión');
          setSession(null);
        } else {
          console.log('ProtectedRoute: Sesión encontrada:', currentSession);
          setSession(currentSession);
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        setSession(null);
        uiToast({
          title: "Error inesperado",
          description: "Ha ocurrido un error al verificar tu sesión.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('ProtectedRoute: Cambio en estado de autenticación:', event);
      
      if (event === 'SIGNED_OUT') {
        toast("Sesión cerrada", {
          description: "Has cerrado sesión correctamente.",
        });
        navigate('/auth');
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/password-reset');
      } else if (event === 'USER_UPDATED') {
        toast("Perfil actualizado", {
          description: "Tu perfil ha sido actualizado correctamente.",
        });
      } else if (event === 'SIGNED_IN') {
        toast("Sesión iniciada", {
          description: "Has iniciado sesión correctamente.",
        });
      }
      
      setSession(newSession);
    });

    return () => {
      console.log('ProtectedRoute: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, [navigate, uiToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-4">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">COPRODELI</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
