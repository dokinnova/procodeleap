import { Button } from "@/components/ui/button";
import { Users, UserPlus, School, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de PROCODELI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink to="/children" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Gestión de Niños</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra los registros de niños
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/sponsors" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-secondary/20 rounded-full">
                <UserPlus className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Gestión de Padrinos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra los padrinos y donaciones
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/schools" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <School className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Gestión de Colegios</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra los colegios registrados
                </p>
              </div>
            </div>
          </Button>
        </RouterLink>

        <RouterLink to="/management" className="w-full">
          <Button
            variant="outline"
            className="w-full h-auto p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Link className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Gestión de Apadrinamientos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra los vínculos entre padrinos y niños
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