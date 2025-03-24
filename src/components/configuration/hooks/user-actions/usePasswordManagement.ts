
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
        // Este endpoint de la API requiere permisos especiales de service_role o supabase_admin
        // Esta función mostrará un error de permisos en el frontend ya que no es posible usar el token service_role
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
      
      // Mensajes de error más específicos basados en el tipo de error
      if (error.message?.includes("not allowed") || 
          error.message?.includes("not admin") || 
          error.message?.includes("not_admin") ||
          error.status === 403) {
        toast.error("No tienes permisos para cambiar contraseñas directamente. Esta funcionalidad requiere un rol de servicio especial en Supabase que no está disponible en el frontend por razones de seguridad.");
      } else {
        toast.error(`Error al cambiar contraseña: ${error.message || "Error desconocido"}`);
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
      toast.error(`Error al enviar email de recuperación: ${error.message || "Error desconocido"}`);
    }
  });

  const handleSendPasswordResetEmail = (email: string) => {
    console.log("Iniciando envío de email de recuperación para:", email);
    sendPasswordResetMutation.mutate(email);
  };

  const handleDirectPasswordChange = (email: string, newPassword: string, userId: string) => {
    console.log("Cambiando contraseña directamente para:", email);
    toast.warning("Esta función no está disponible por razones de seguridad. Utilizando la opción de enviar email en su lugar.");
    // En lugar de intentar el cambio directo, enviamos un email
    handleSendPasswordResetEmail(email);
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
