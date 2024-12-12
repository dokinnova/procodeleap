import { Card } from "@/components/ui/card";
import { Users, UserPlus, School } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de PROCODELI
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/20 rounded-full">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Gestión de Niños</h3>
              <p className="text-sm text-muted-foreground">
                Administra los registros de niños
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-secondary/20 rounded-full">
              <UserPlus className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Gestión de Padrinos</h3>
              <p className="text-sm text-muted-foreground">
                Administra los padrinos y donaciones
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-accent/20 rounded-full">
              <School className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Gestión General</h3>
              <p className="text-sm text-muted-foreground">
                Configuración y administración
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;