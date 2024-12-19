import { Button } from "@/components/ui/button";
import { Users, UserPlus, School, Link as LinkIcon, Receipt, LogOut } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Control</h2>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión de PROCODELI
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink to="/children" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Users className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Gestión de Niños</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los registros de niños
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/sponsors" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-secondary/20 rounded-full">
                <UserPlus className="w-6 sm:w-8 h-6 sm:h-8 text-secondary-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Gestión de Padrinos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los padrinos y donaciones
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/schools" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <School className="w-6 sm:w-8 h-6 sm:h-8 text-accent-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Gestión de Colegios</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los colegios registrados
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/management" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <LinkIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Gestión de Apadrinamientos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los vínculos entre padrinos y niños
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/receipts" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-secondary/20 rounded-full">
                <Receipt className="w-6 sm:w-8 h-6 sm:h-8 text-secondary-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Gestión de Recibos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los recibos y pagos
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>
      </div>
    </div>
  );
};

export default Index;