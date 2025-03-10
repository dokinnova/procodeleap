
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./AuthForm";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ProtectedRoute: Verificando sesión...');
    
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Error al verificar sesión:', error);
          setSession(null);
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión de nuevo.",
            variant: "destructive",
          });
        } else if (!currentSession) {
          console.log('ProtectedRoute: No se encontró sesión');
          
          // Si estamos en /auth/callback con errores, redirigir a /auth
          if (location.pathname === '/auth/callback' && location.search.includes('error')) {
            console.log('ProtectedRoute: Redirigiendo de callback con error a /auth');
            navigate('/auth', { replace: true });
          }
          
          setSession(null);
        } else {
          console.log('ProtectedRoute: Sesión encontrada:', currentSession);
          setSession(currentSession);
        }
      } catch (error: any) {
        console.error('ProtectedRoute: Error:', error);
        setSession(null);
        toast({
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('ProtectedRoute: Cambio de estado de auth:', _event);
      if (_event === 'SIGNED_OUT') {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
        });
      }
      setSession(session);
    });

    return () => {
      console.log('ProtectedRoute: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Si estamos en la ruta de autenticación o sus subrutas, mostrar el formulario de autenticación
    if (location.pathname.startsWith('/auth')) {
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
    
    // Si no estamos en la ruta de autenticación y no hay sesión, redirigir a /auth
    navigate('/auth', { replace: true });
    return null;
  }

  return <>{children}</>;
};
