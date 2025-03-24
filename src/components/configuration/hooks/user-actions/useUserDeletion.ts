
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log("Iniciando proceso de eliminación para usuario:", userId);
        
        // First, we need to handle tasks assigned to this user
        const { data: appUserData, error: appUserError } = await supabase
          .from("app_users")
          .select("id")
          .eq("user_id", userId)
          .single();
          
        if (appUserError) {
          console.error("Error obteniendo el app_user_id:", appUserError);
          throw new Error("Error identificando el usuario: " + appUserError.message);
        }
        
        const appUserId = appUserData.id;
        console.log("ID de app_user a eliminar:", appUserId);
        
        // Check for tasks assigned to this user
        const { data: tasksData, error: tasksQueryError } = await supabase
          .from("tasks")
          .select("id")
          .eq("assigned_user_id", appUserId);
          
        if (tasksQueryError) {
          console.error("Error verificando tareas del usuario:", tasksQueryError);
          throw new Error("Error verificando tareas del usuario: " + tasksQueryError.message);
        }
        
        // If there are tasks assigned, update them to remove the assignment
        if (tasksData && tasksData.length > 0) {
          console.log(`Desasignando ${tasksData.length} tareas del usuario antes de eliminarlo`);
          
          const { error: tasksUpdateError } = await supabase
            .from("tasks")
            .update({ assigned_user_id: null })
            .eq("assigned_user_id", appUserId);
            
          if (tasksUpdateError) {
            console.error("Error al desasignar tareas:", tasksUpdateError);
            throw new Error("Error al liberar tareas asignadas: " + tasksUpdateError.message);
          }
          
          console.log("Tareas desasignadas exitosamente");
        } else {
          console.log("No hay tareas asignadas a este usuario");
        }
        
        // Now proceed with user deletion
        console.log("Procediendo con la eliminación del usuario con app_user_id:", appUserId);
        
        // For users with the temporary ID, use a different approach
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // Get the app_users records for the temporary user
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("email, id")
            .eq("user_id", userId);
            
          if (userError) {
            console.error("Error obteniendo datos del usuario temporal:", userError);
            throw userError;
          }
          
          if (!userData || userData.length === 0) {
            throw new Error("No se encontró el usuario para eliminar");
          }
          
          // Check if there are multiple users with the same temporary ID
          if (userData.length > 1) {
            // Delete only the specific user by table id
            const selectedUserId = userData[0].id;
            const { error } = await supabase
              .from("app_users")
              .delete()
              .eq("id", selectedUserId);
              
            if (error) {
              console.error("Error eliminando usuario temporal específico:", error);
              throw error;
            }
          } else {
            // Delete the only user found
            const { error } = await supabase
              .from("app_users")
              .delete()
              .eq("id", userData[0].id);
              
            if (error) {
              console.error("Error eliminando usuario temporal:", error);
              throw error;
            }
          }
        } else {
          // Normal deletion for users with real ID
          // First get the app_user ID from the auth user ID
          const { error } = await supabase
            .from("app_users")
            .delete()
            .eq("id", appUserId);
            
          if (error) {
            console.error("Error eliminando usuario regular:", error);
            throw error;
          }
        }
        
        console.log("Usuario eliminado exitosamente:", userId);
        return userId;
      } catch (error: any) {
        console.error("Error durante el proceso de eliminación del usuario:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error: any) => {
      toast.error("Error al eliminar usuario: " + error.message);
    },
  });

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  return {
    handleDeleteUser
  };
};
