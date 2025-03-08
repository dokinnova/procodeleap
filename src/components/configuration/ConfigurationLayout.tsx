
import { Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LogoUploader } from "@/components/configuration/LogoUploader";
import { BackgroundSettings } from "@/components/configuration/BackgroundSettings";
import { AppUsersTable } from "@/components/configuration/AppUsersTable";
import { AddUserForm } from "@/components/configuration/AddUserForm";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ConfigurationLayout = () => {
  const { role } = useUserPermissions();
  const isAdmin = role === 'admin';

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            Solo los administradores pueden acceder a la configuración del sistema.
            Contacta al administrador para solicitar acceso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Logo del Sitio</h2>
        <LogoUploader currentLogo={settings?.logo_url} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Personalización de Fondo</h2>
        <BackgroundSettings />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Añadir Usuario</h2>
        <AddUserForm />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
        <AppUsersTable />
      </Card>
    </div>
  );
};
