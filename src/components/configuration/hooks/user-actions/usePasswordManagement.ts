
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordManagement = () => {
  const changePasswordMutation = useMutation({
    mutationFn: async ({ 
      email, 
      newPassword, 
      userId 
    }: { 
      email: string; 
      newPassword: string; 
      userId: string 
    }) => {
      try {
        // This API requires service_role or supabase_admin permissions
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );
        
        if (error) {
          console.error("Error cambiando contraseña directamente:", error);
          throw error;
        }
        
        return email;
      } catch (error: any) {
        console.error("Error en el cambio de contraseña:", error);
        throw error;
      }
    },
    onSuccess: (email) => {
      toast.success(`Contraseña cambiada exitosamente para ${email}`);
    },
    onError: (error: any) => {
      console.error("Error en el cambio de contraseña:", error);
      
      // More specific error messages based on the error type
      if (error.message.includes("not allowed") || 
          error.message.includes("not admin") || 
          error.message.includes("not_admin") ||
          error.status === 403) {
        toast.error("No tienes permisos para cambiar contraseñas directamente. Esta funcionalidad requiere un rol de servicio especial en Supabase que no está disponible en el frontend.");
      } else {
        toast.error(`Error al cambiar contraseña: ${error.message}`);
      }
    }
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
    },
    onError: (error: any) => {
      console.error("Error en el proceso de recuperación de contraseña:", error);
      toast.error(`Error al enviar email de recuperación: ${error.message}`);
    }
  });

  const handleSendPasswordResetEmail = (email: string) => {
    console.log("Iniciando envío de email de recuperación para:", email);
    sendPasswordResetMutation.mutate(email);
  };

  const handleDirectPasswordChange = (email: string, newPassword: string, userId: string) => {
    console.log("Cambiando contraseña directamente para:", email);
    changePasswordMutation.mutate({ email, newPassword, userId });
  };

  return {
    handleSendPasswordResetEmail,
    handleDirectPasswordChange,
    isPasswordResetLoading: sendPasswordResetMutation.isPending,
    passwordResetError: sendPasswordResetMutation.error?.message || null,
    passwordResetSuccess: sendPasswordResetMutation.isSuccess,
    isPasswordChangeLoading: changePasswordMutation.isPending,
    passwordChangeError: changePasswordMutation.error?.message || null,
    passwordChangeSuccess: changePasswordMutation.isSuccess,
  };
};
