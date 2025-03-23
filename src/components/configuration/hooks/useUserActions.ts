
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppUser } from "../utils/userSync";
import { UserRole } from "@/hooks/useUserPermissions";

export const useUserActions = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<{ id: string; email: string } | null>(null);

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
          // Obtenemos el email del usuario seleccionado (debe ser pasado desde la interfaz)
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("email, id")
            .eq("user_id", userId)
            .single();
            
          if (userError) throw userError;
          
          // Eliminamos el registro usando id de la tabla app_users
          const { error } = await supabase
            .from("app_users")
            .delete()
            .eq("id", userData.id);
            
          if (error) throw error;
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

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from("app_users")
        .update({ role })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usuario role actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar usuario role: " + error.message);
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

  const handleChangePasswordClick = (userId: string, email: string) => {
    if (userId && email) {
      setPasswordChangeUser({ id: userId, email });
    }
  };

  return {
    editingUser,
    passwordChangeUser,
    handleEditClick,
    handleSaveRole,
    handleDeleteUser,
    handleChangePasswordClick,
    setPasswordChangeUser,
  };
};
