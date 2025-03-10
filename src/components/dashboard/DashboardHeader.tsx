
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useState } from "react";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      console.log("Attempting to sign out...");
      
      // Sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signOut:", error);
        toast("Error al cerrar sesión", {
          description: error.message,
        });
        setIsLoggingOut(false);
        return;
      }

      // Show success toast
      toast("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      });

      // Navigate to auth page
      console.log("Signed out successfully, redirecting to auth page");
      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast("Error", {
        description: "No se pudo cerrar sesión correctamente.",
      });
      
      // Even if there's an error, try to redirect to auth page
      navigate("/auth", { replace: true });
    } finally {
      setIsLoggingOut(false);
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
      <Button 
        variant="outline" 
        onClick={handleLogout}
        size="sm"
        disabled={isLoggingOut}
        className="flex items-center gap-2 border-violet-200 hover:bg-violet-50"
      >
        <LogOut className="h-4 w-4 text-violet-600" />
        {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
      </Button>
    </div>
  );
};
