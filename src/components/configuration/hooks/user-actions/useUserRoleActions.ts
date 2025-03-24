
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserPermissions";
import { AppUser } from "../../utils/user-sync";

export const useUserRoleActions = () => {
  const queryClient = useQueryClient();

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
    },
    onError: (error) => {
      toast.error("Error al actualizar usuario role: " + error.message);
    },
  });

  const setUserAsAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email)
        .single();
        
      if (userError) {
        console.error("Error finding user:", userError);
        throw new Error(`Usuario con email ${email} no encontrado`);
      }
      
      // Then update the user's role to admin
      const { error } = await supabase
        .from("app_users")
        .update({ role: 'admin' })
        .eq("id", userData.id);
        
      if (error) throw error;
      
      return userData;
    },
    onSuccess: (user) => {
      toast.success(`Usuario ${user.email} ahora tiene permisos de administrador`);
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error: any) => {
      toast.error("Error al actualizar permisos: " + error.message);
    },
  });

  const handleSaveRole = (userId: string, role: UserRole) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const setUserAsAdmin = (email: string) => {
    setUserAsAdminMutation.mutate(email);
  };

  return {
    handleSaveRole,
    setUserAsAdmin,
  };
};
