
import { useState } from "react";
import { Settings, UserPlus, Eye, EyeOff } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserPermissions";

const Configuration = () => {
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("viewer");
  const [showPassword, setShowPassword] = useState(false);
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
    mutationFn: async ({ email, password, userRole }: { email: string, password: string, userRole: UserRole }) => {
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
      
      // Create user record in app_users with selected role
      const { error: userError } = await supabase
        .from("app_users")
        .insert({
          email,
          user_id: data.user.id,
          role: userRole
        });

      if (userError) throw userError;
      
      return data;
    },
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("viewer");
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
    addUserMutation.mutate({ 
      email: newUserEmail, 
      password: newUserPassword, 
      userRole: newUserRole 
    });
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
          <div className="max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Email del nuevo usuario"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="mb-2 w-full"
            />
            <div className="relative mb-2">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña del nuevo usuario"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Select 
              value={newUserRole} 
              onValueChange={(value) => setNewUserRole(value as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center">
            <Button type="submit">
              <UserPlus className="w-4 h-4 mr-2" />
              Añadir Usuario
            </Button>
          </div>
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
