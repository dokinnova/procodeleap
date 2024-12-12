import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const AdminUsersTable = () => {
  const queryClient = useQueryClient();

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select(`
          *,
          user:user_id (
            email
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Administrador eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error("Error al eliminar administrador: " + error.message);
    },
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adminUsers?.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell>{admin.user?.email}</TableCell>
            <TableCell>{admin.role}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteAdminMutation.mutate(admin.user_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )TableBody>
      </TableBody>
    </Table>
  );
};