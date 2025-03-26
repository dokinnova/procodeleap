
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log("Iniciando proceso de eliminación para usuario:", userId);
        
        // Handle deletion differently based on whether it's a temporary user or real user
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // For temporary users, we need to handle multiple potential matches
          console.log("Procesando eliminación de usuario temporal");
          
          // For users with the temporary ID, use a different approach
          // Get the app_users records for the temporary user
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("id, email")
            .eq("user_id", userId);
            
          if (userError) {
            console.error("Error obteniendo datos del usuario temporal:", userError);
            throw userError;
          }
          
          if (!userData || userData.length === 0) {
            throw new Error("No se encontró el usuario para eliminar");
          }
          
          console.log("Usuarios temporales encontrados:", userData.length);
          
          // Process each temporary user one by one
          for (const user of userData) {
            const appUserId = user.id;
            console.log("Procesando usuario temporal con ID:", appUserId, "y email:", user.email);
            
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
            
            // Now delete the specific user
            const { error: deleteError } = await supabase
              .from("app_users")
              .delete()
              .eq("id", appUserId);
              
            if (deleteError) {
              console.error("Error eliminando usuario temporal:", deleteError);
              throw deleteError;
            }
            
            console.log("Usuario temporal eliminado exitosamente:", appUserId);
          }
          
          return userId;
        } else {
          // For regular users with a real ID
          console.log("Procesando eliminación de usuario regular");
          
          // Get the app_user ID from the auth user ID
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
          const { error } = await supabase
            .from("app_users")
            .delete()
            .eq("id", appUserId);
            
          if (error) {
            console.error("Error eliminando usuario regular:", error);
            throw error;
          }
          
          console.log("Usuario eliminado exitosamente:", userId);
          return userId;
        }
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
