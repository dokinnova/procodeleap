
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit2, Check, RefreshCw } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserPermissions";

type AppUser = Database['public']['Tables']['app_users']['Row'];

export const AppUsersTable = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Función para sincronizar usuarios
  const syncUsers = async () => {
    setIsSyncing(true);
    try {
      // Primero obtenemos todos los usuarios de app_users
      const { data: existingAppUsers, error } = await supabase
        .from("app_users")
        .select("*");
      
      if (error) throw error;
      
      // Creamos un conjunto de emails para búsqueda rápida
      const existingEmails = new Set();
      if (existingAppUsers) {
        existingAppUsers.forEach(user => {
          if (user.email) {
            existingEmails.add(user.email.toLowerCase());
          }
        });
      }
      
      // Comprobamos si hay un usuario actualmente autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const currentUser = session.user;
        
        // Verificamos si el usuario actual ya está en app_users
        if (currentUser.email && !existingEmails.has(currentUser.email.toLowerCase())) {
          console.log("Añadiendo usuario actual a app_users:", currentUser.email);
          
          const { error: insertError } = await supabase
            .from("app_users")
            .insert({
              email: currentUser.email,
              user_id: currentUser.id,
              role: 'admin' as UserRole // El primer usuario que se añade es admin
            });
            
          if (insertError) {
            console.error("Error al insertar usuario actual:", insertError);
            toast.error("Error al sincronizar el usuario actual");
          } else {
            toast.success("Usuario actual sincronizado correctamente");
          }
        } else {
          // Buscamos usuarios con email igual al actual pero con user_id temporal
          const { data: tempUsers } = await supabase
            .from("app_users")
            .select("*")
            .eq("email", currentUser.email.toLowerCase())
            .eq("user_id", "00000000-0000-0000-0000-000000000000");

          if (tempUsers && tempUsers.length > 0) {
            // Actualizamos el user_id temporal con el actual
            const { error: updateError } = await supabase
              .from("app_users")
              .update({ user_id: currentUser.id })
              .eq("email", currentUser.email.toLowerCase())
              .eq("user_id", "00000000-0000-0000-0000-000000000000");

            if (updateError) {
              console.error("Error al actualizar user_id temporal:", updateError);
              toast.error("Error al actualizar sincronización de usuario");
            } else {
              toast.success("Usuario sincronizado correctamente");
            }
          }
        }
      }

      // Sincronizar registros existentes que tengan email pero con user_id temporal
      if (existingAppUsers) {
        const incompleteUsers = existingAppUsers.filter(user => 
          user.user_id === "00000000-0000-0000-0000-000000000000" && user.email);
        
        if (incompleteUsers.length > 0) {
          toast.info(`Hay ${incompleteUsers.length} usuarios pendientes de sincronización.`);
        }
      }

      // Refrescar la consulta para mostrar los cambios
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      toast.success("Sincronización completada");
    } catch (error: any) {
      console.error("Error general al sincronizar usuarios:", error);
      toast.error("Error al sincronizar usuarios: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Ejecutar sincronización al cargar el componente
  useEffect(() => {
    syncUsers();
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

  const handleManualSync = () => {
    syncUsers();
  };

  if (isLoading || isSyncing) {
    return <div>Cargando usuarios...</div>;
  }

  // Separar usuarios sincronizados y pendientes
  const pendingUsers = appUsers?.filter(user => user.user_id === "00000000-0000-0000-0000-000000000000") || [];
  const syncedUsers = appUsers?.filter(user => user.user_id !== "00000000-0000-0000-0000-000000000000") || [];

  return (
    <div className="space-y-4">
      {appUsers && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
          <div>
            <p className="text-blue-800 font-medium">
              Total de usuarios registrados: <span className="font-bold">{appUsers.length}</span>
            </p>
            {pendingUsers.length > 0 && (
              <p className="text-amber-600 text-sm">
                Usuarios pendientes de sincronización: <span className="font-bold">{pendingUsers.length}</span>
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appUsers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            appUsers?.map((user) => (
              <TableRow key={user.id} className={user.user_id === "00000000-0000-0000-0000-000000000000" ? "bg-amber-50" : ""}>
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
                  {user.user_id === "00000000-0000-0000-0000-000000000000" ? (
                    <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">
                      Pendiente
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      Sincronizado
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
