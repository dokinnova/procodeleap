
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useState, useEffect } from "react";
import { UserRole } from "@/hooks/useUserPermissions";
import { UserTableRow } from "./users/UserTableRow";
import { UserStats } from "./users/UserStats";
import { AppUser, AuthUserInfo, syncUsers } from "./utils/userSync";

export const AppUsersTable = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authUsers, setAuthUsers] = useState<Record<string, AuthUserInfo>>({});

  // Ejecutar sincronización al cargar el componente
  useEffect(() => {
    handleManualSync();
  }, []);

  const { data: appUsers, isLoading } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*");
      
      if (error) throw error;
      return data as AppUser[];
    },
  });

  // Consulta para obtener la sesión actual del usuario autenticado
  const { data: sessionData } = useQuery({
    queryKey: ["current-user-session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // No permitimos eliminar usuarios con user_id temporal
      if (userId === "00000000-0000-0000-0000-000000000000") {
        throw new Error("No se puede eliminar un usuario que aún no ha iniciado sesión");
      }
      
      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error("Error al eliminar usuario: " + error.message);
      setUserToDelete(null);
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from("app_users")
        .update({ role })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rol de usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar rol de usuario: " + error.message);
    },
  });

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
  };

  const handleSaveRole = (userId: string, role: UserRole) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleManualSync = () => {
    syncUsers(setIsSyncing, setAuthUsers, queryClient);
  };

  // Verificar si el usuario actual es el usuario de la fila
  const isCurrentUser = (userId: string) => {
    return sessionData?.user?.id === userId;
  };

  if (isLoading || isSyncing) {
    return <div>Cargando usuarios...</div>;
  }

  // Separar usuarios sincronizados y pendientes
  const pendingUsers = appUsers?.filter(user => user.user_id === "00000000-0000-0000-0000-000000000000") || [];
  const syncedUsers = appUsers?.filter(user => user.user_id !== "00000000-0000-0000-0000-000000000000") || [];

  return (
    <div className="space-y-4">
      <UserStats 
        users={appUsers}
        pendingUsers={pendingUsers}
        isSyncing={isSyncing}
        onSyncClick={handleManualSync}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última autenticación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appUsers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            appUsers?.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                authUsers={authUsers}
                isCurrentUser={isCurrentUser(user.user_id)}
                editingUser={editingUser}
                onEditClick={handleEditClick}
                onSaveRole={handleSaveRole}
                onDeleteClick={handleDeleteUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
