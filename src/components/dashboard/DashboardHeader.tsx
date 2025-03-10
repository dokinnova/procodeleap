
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasSession, setHasSession] = useState(false);

  // Verificar si hay una sesión antes de mostrar el botón de cerrar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });
    
    return () => {
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

      // No mostrar mensaje de éxito, dejemos que los componentes de auth manejen esto
      console.log("Sesión cerrada exitosamente");

      // Force navigation to login
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      
      // Even if there's an error, redirect to auth page
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
        <Button 
          variant="outline" 
          onClick={handleLogout}
          size="sm"
          className="flex items-center gap-2 border-violet-200 hover:bg-violet-50"
        >
          <LogOut className="h-4 w-4 text-violet-600" />
          Cerrar sesión
        </Button>
      )}
    </div>
  );
};
