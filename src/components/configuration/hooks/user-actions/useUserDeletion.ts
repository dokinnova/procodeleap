
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Primero liberar cualquier tarea asignada a este usuario
        const { error: tasksError } = await supabase
          .from("tasks")
          .update({ assigned_user_id: null })
          .eq("assigned_user_id", userId);
          
        if (tasksError) throw tasksError;
        
        // Para usuarios que nunca se han conectado (con ID temporal), necesitamos eliminar por email
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // Obtenemos el email del usuario seleccionado
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("email, id")
            .eq("user_id", userId);
            
          if (userError) throw userError;
          
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
              
            if (error) throw error;
          } else {
            // Eliminar el único usuario encontrado
            const { error } = await supabase
              .from("app_users")
              .delete()
              .eq("id", userData[0].id);
              
            if (error) throw error;
          }
        } else {
          // Eliminación normal para usuarios con ID de usuario real
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
