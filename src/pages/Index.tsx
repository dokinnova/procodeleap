import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, School, Plus, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Control</h2>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión de PROCODELI
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/management">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Apadrinamiento
            </Button>
          </Link>
          <Link to="/receipts">
            <Button variant="secondary">
              <FileText className="w-4 h-4 mr-2" />
              Generar Recibos
            </Button>
          </Link>
          <Link to="/configuration">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/children">
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
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
        </Link>

        <Link to="/sponsors">
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
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
        </Link>

        <Link to="/schools">
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-accent/20 rounded-full">
                <School className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Gestión de Colegios</h3>
                <p className="text-sm text-muted-foreground">
                  Administra los colegios registrados
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;