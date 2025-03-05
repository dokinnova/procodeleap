
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit2, Check } from "lucide-react";
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
import { Database } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserPermissions";

type AppUser = Database['public']['Tables']['app_users']['Row'];

export const AppUsersTable = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [syncingUsers, setSyncingUsers] = useState(false);

  const { data: appUsers, isLoading, refetch } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      // Intentar sincronizar usuarios de Auth con app_users si están faltando
      try {
        // Primero obtenemos todos los usuarios de app_users
        const { data: existingAppUsers, error } = await supabase
          .from("app_users")
          .select("*");
        
        if (error) throw error;
        
        // Buscamos usuarios en auth que no tienen entrada en app_users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error al obtener usuarios de Auth:", authError);
          // Si no podemos acceder a Auth API, simplemente devolvemos los usuarios existentes
          return existingAppUsers as AppUser[];
        }
        
        if (authUsers && existingAppUsers) {
          // Creamos un conjunto de correos electrónicos de usuarios existentes para búsqueda rápida
          const existingEmails = new Set(existingAppUsers.map(user => user.email));
          
          // Identificamos usuarios de Auth que no están en app_users
          const missingUsers = authUsers.users.filter(authUser => 
            authUser.email && !existingEmails.has(authUser.email)
          );
          
          // Si encontramos usuarios faltantes, los agregamos a app_users
          if (missingUsers.length > 0) {
            console.log("Sincronizando usuarios faltantes:", missingUsers.length);
            setSyncingUsers(true);
            
            for (const user of missingUsers) {
              if (user.email) {
                const { error: insertError } = await supabase
                  .from("app_users")
                  .insert({
                    email: user.email,
                    user_id: user.id,
                    role: 'viewer' as UserRole // Rol predeterminado
                  });
                
                if (insertError) {
                  console.error("Error al insertar usuario:", insertError);
                }
              }
            }
            
            setSyncingUsers(false);
            
            // Volvemos a obtener la lista actualizada de usuarios
            const { data: updatedUsers, error: updatedError } = await supabase
              .from("app_users")
              .select("*");
            
            if (updatedError) throw updatedError;
            return updatedUsers as AppUser[];
          }
        }
        
        return existingAppUsers as AppUser[];
      } catch (error) {
        console.error("Error al sincronizar usuarios:", error);
        // En caso de error, intentamos obtener al menos los usuarios existentes
        const { data, error: fetchError } = await supabase
          .from("app_users")
          .select("*");
        
        if (fetchError) throw fetchError;
        return data as AppUser[];
      }
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
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
      setSelectedRole(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar rol de usuario: " + error.message);
    },
  });

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
    setSelectedRole(user.role as UserRole);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
  };

  const handleSaveRole = () => {
    if (editingUser && selectedRole) {
      updateUserRoleMutation.mutate({
        userId: editingUser.user_id,
        role: selectedRole
      });
    }
  };

  const handleSyncUsers = () => {
    refetch();
  };

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleSyncUsers}
          disabled={syncingUsers}
          variant="outline"
          size="sm"
        >
          {syncingUsers ? "Sincronizando..." : "Sincronizar usuarios"}
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appUsers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            appUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <div className="flex items-center space-x-2">
                      <Select value={selectedRole || user.role} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handleSaveRole}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                      user.role === 'editor' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 
                      user.role === 'editor' ? 'Editor' : 'Visualizador'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(user)}
                      disabled={editingUser !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog open={userToDelete === user.user_id} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setUserToDelete(user.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el usuario permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUserMutation.mutate(user.user_id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
