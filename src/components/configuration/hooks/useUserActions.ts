
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppUser } from "../utils/user-sync";
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

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log(`Intentando enviar email de recuperación a: ${email}`);
      const origin = window.location.origin;
      const redirectTo = `${origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      
      if (error) {
        console.error("Error al enviar email de recuperación:", error);
        throw error;
      }
      
      return email;
    },
    onSuccess: (email) => {
      console.log(`Email de recuperación enviado con éxito a: ${email}`);
      toast.success(`Email de recuperación enviado a ${email}`);
      setPasswordChangeUser(null);
    },
    onError: (error: any) => {
      console.error("Error en el proceso de recuperación de contraseña:", error);
      toast.error(`Error al enviar email de recuperación: ${error.message}`);
    }
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
    console.log("Abriendo diálogo de cambio de contraseña para:", email);
    if (userId && email) {
      setPasswordChangeUser({ id: userId, email });
    }
  };

  const handleSendPasswordResetEmail = (email: string) => {
    console.log("Iniciando envío de email de recuperación para:", email);
    sendPasswordResetMutation.mutate(email);
  };

  return {
    editingUser,
    passwordChangeUser,
    handleEditClick,
    handleSaveRole,
    handleDeleteUser,
    handleChangePasswordClick,
    setPasswordChangeUser,
    handleSendPasswordResetEmail,
    isPasswordResetLoading: sendPasswordResetMutation.isPending,
    passwordResetError: sendPasswordResetMutation.error?.message || null,
    passwordResetSuccess: sendPasswordResetMutation.isSuccess,
  };
};
