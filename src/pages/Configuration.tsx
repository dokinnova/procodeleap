import { useState } from "react";
import { Settings, Upload, UserPlus, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsersTable } from "@/components/configuration/AdminUsersTable";
import { LogoUploader } from "@/components/configuration/LogoUploader";

const Configuration = () => {
  const queryClient = useQueryClient();
  const [newAdminEmail, setNewAdminEmail] = useState("");

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

  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data: userData, error: userError } = await supabase
        .from("admin_users")
        .insert([{ email }]);
      if (userError) throw userError;
      return userData;
    },
    onSuccess: () => {
      toast.success("Administrador añadido correctamente");
      setNewAdminEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error("Error al añadir administrador: " + error.message);
    },
  });

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      toast.error("Por favor, introduce un email");
      return;
    }
    addAdminMutation.mutate(newAdminEmail);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Logo del Sitio</h2>
            <LogoUploader currentLogo={settings?.logo_url} />
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Añadir Administrador</h2>
            <form onSubmit={handleAddAdmin} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email del nuevo administrador"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <Button type="submit">
                <UserPlus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Administradores</h2>
            <AdminUsersTable />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuration;