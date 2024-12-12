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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export const AdminUsersTable = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*");
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
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error("Error al eliminar administrador: " + error.message);
      setUserToDelete(null);
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
            <TableCell>{admin.email}</TableCell>
            <TableCell>{admin.role}</TableCell>
            <TableCell>
              <AlertDialog open={userToDelete === admin.user_id} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setUserToDelete(admin.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el administrador permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAdminMutation.mutate(admin.user_id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};