
import { useState } from "react";
import { Settings, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AppUsersTable } from "@/components/configuration/AppUsersTable";
import { LogoUploader } from "@/components/configuration/LogoUploader";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Configuration = () => {
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const { canCreate, role } = useUserPermissions();
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

  const addUserMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      // First check if user already exists in app_users
      const { data: existingUser } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email)
        .single();
        
      if (existingUser) {
        throw new Error("Este usuario ya existe en el sistema");
      }
      
      // Create user with email and password
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) throw error;
      
      // Create user record in app_users with default role
      const { error: userError } = await supabase
        .from("app_users")
        .insert({
          email,
          user_id: data.user.id,
          role: 'viewer'
        });

      if (userError) throw userError;
      
      return data;
    },
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      setNewUserEmail("");
      setNewUserPassword("");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error) => {
      toast.error("Error al añadir usuario: " + error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) {
      toast.error("Por favor, introduce un email");
      return;
    }
    if (!newUserPassword || newUserPassword.length < 6) {
      toast.error("Por favor, introduce una contraseña de al menos 6 caracteres");
      return;
    }
    addUserMutation.mutate({ email: newUserEmail, password: newUserPassword });
  };

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
        <h2 className="text-xl font-semibold mb-4">Añadir Usuario</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email del nuevo usuario"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="mb-2"
            />
            <Input
              type="password"
              placeholder="Contraseña del nuevo usuario"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
            />
          </div>
          <Button type="submit">
            <UserPlus className="w-4 h-4 mr-2" />
            Añadir Usuario
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
        <AppUsersTable />
      </Card>
    </div>
  );
};

export default Configuration;
