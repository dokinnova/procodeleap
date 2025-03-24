
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log("Iniciando proceso de eliminación para usuario:", userId);
        
        // Primero, verificar todas las tareas asignadas a este usuario
        const { data: tasksData, error: tasksQueryError } = await supabase
          .from("tasks")
          .select("id, assigned_user_id")
          .eq("assigned_user_id", userId);
          
        if (tasksQueryError) {
          console.error("Error verificando tareas del usuario:", tasksQueryError);
          throw new Error("Error verificando tareas del usuario: " + tasksQueryError.message);
        }
        
        // Si hay tareas asignadas, las actualizamos para dejarlas sin asignar
        if (tasksData && tasksData.length > 0) {
          console.log(`Desasignando ${tasksData.length} tareas del usuario antes de eliminarlo`);
          
          const { error: tasksUpdateError } = await supabase
            .from("tasks")
            .update({ assigned_user_id: null })
            .eq("assigned_user_id", userId);
            
          if (tasksUpdateError) {
            console.error("Error al desasignar tareas:", tasksUpdateError);
            throw new Error("Error al liberar tareas asignadas: " + tasksUpdateError.message);
          }
        }
        
        // Ahora procedemos con la eliminación del usuario
        console.log("Procediendo con la eliminación del usuario:", userId);
        
        // Para usuarios temporales, usamos un enfoque diferente
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // Obtener los registros de app_users para el usuario temporal
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
          
          // Verificar si existe más de un usuario con el mismo ID temporal
          if (userData.length > 1) {
            // Si hay múltiples usuarios, eliminar solo el específico por su id de tabla
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
            // Eliminar el único usuario encontrado
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
          // Eliminación normal para usuarios con ID real
          const { error } = await supabase
            .from("app_users")
            .delete()
            .eq("user_id", userId);
            
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
