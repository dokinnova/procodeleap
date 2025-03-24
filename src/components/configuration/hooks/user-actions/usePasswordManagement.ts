
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordManagement = () => {
  // Mantenemos la mutación para compatibilidad, pero no se puede usar en frontend
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
      // Esta función no se puede usar desde el frontend por limitaciones de seguridad de Supabase
      toast.error("Por razones de seguridad, no se puede cambiar la contraseña directamente. Se enviará un email de recuperación en su lugar.");
      throw new Error("Cambio directo de contraseña no disponible en frontend por seguridad");
    },
    onError: (error: any) => {
      console.error("Error en el cambio de contraseña:", error);
      toast.error("Por razones de seguridad de Supabase, el cambio directo de contraseñas solo está disponible usando el método de email de recuperación.");
    }
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log(`Enviando email de recuperación a: ${email}`);
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
    console.log("Usando método de email en lugar de cambio directo para:", email);
    toast.info("Por seguridad, se enviará un email de recuperación en lugar de cambiar la contraseña directamente.");
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
