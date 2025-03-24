
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        // First, check if there are tasks assigned to this user
        const { data: tasksData, error: tasksQueryError } = await supabase
          .from("tasks")
          .select("id")
          .eq("assigned_user_id", userId);
          
        if (tasksQueryError) {
          console.error("Error checking user tasks:", tasksQueryError);
          throw new Error("Error verificando tareas del usuario: " + tasksQueryError.message);
        }
        
        // If there are assigned tasks, update them to unassigned
        if (tasksData && tasksData.length > 0) {
          console.log(`Unassigning ${tasksData.length} tasks from user before deletion`);
          
          const { error: tasksError } = await supabase
            .from("tasks")
            .update({ assigned_user_id: null })
            .eq("assigned_user_id", userId);
            
          if (tasksError) {
            console.error("Error unassigning tasks:", tasksError);
            throw new Error("Error al liberar tareas asignadas: " + tasksError.message);
          }
        }
        
        // For users who never connected (with temporary ID), we need to delete by email
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // Get the email of the selected user
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("email, id")
            .eq("user_id", userId);
            
          if (userError) throw userError;
          
          if (!userData || userData.length === 0) {
            throw new Error("No se encontró el usuario para eliminar");
          }
          
          // Check if there's more than one user with the same temporary ID
          if (userData.length > 1) {
            // If there are multiple users, delete only the specific one by table id
            const selectedUserId = userData[0].id;
            const { error } = await supabase
              .from("app_users")
              .delete()
              .eq("id", selectedUserId);
              
            if (error) throw error;
          } else {
            // Delete the only user found
            const { error } = await supabase
              .from("app_users")
              .delete()
              .eq("id", userData[0].id);
              
            if (error) throw error;
          }
        } else {
          // Normal deletion for users with real user ID
          const { error } = await supabase
            .from("app_users")
            .delete()
            .eq("user_id", userId);
            
          if (error) throw error;
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
