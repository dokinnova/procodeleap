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
        const { error: tasksError } = await supabase
          .from("tasks")
          .update({ assigned_user_id: null })
          .eq("assigned_user_id", userId);
          
        if (tasksError) throw tasksError;
        
        const { error } = await supabase
          .from("app_users")
          .delete()
          .eq("user_id", userId);
          
        if (error) throw error;
      } catch (error: any) {
        console.error("Error during user deletion process:", error);
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
