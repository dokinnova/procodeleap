
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasSession, setHasSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Verificar si hay una sesión antes de mostrar el botón de cerrar sesión
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setHasSession(!!data.session);
          setUserEmail(data.session?.user?.email || null);
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setHasSession(!!session);
        setUserEmail(session?.user?.email || null);
        checkSession();
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si no hay sesión, simplemente redirigir sin mostrar mensaje
        navigate("/auth", { replace: true });
        return;
      }
      
      // If we have a session, try to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }

      console.log("Sesión cerrada exitosamente");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="flex justify-between items-center pb-4 border-b border-purple-100">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Panel de Control</h2>
        <p className="text-muted-foreground text-sm">
          Sistema de gestión COPRODELI
        </p>
      </div>
      
      {hasSession && (
        <div className="flex items-center gap-3">
          {userEmail && (
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-1 text-violet-500" />
              <span>{userEmail}</span>
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleLogout}
            size="sm"
            className="flex items-center gap-2 border-violet-200 hover:bg-violet-50"
          >
            <LogOut className="h-4 w-4 text-violet-600" />
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  );
};
