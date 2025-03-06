
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserPermissions";

type AddUserParams = {
  email: string;
  password: string;
  userRole: UserRole;
};

export const useAddUser = () => {
  const queryClient = useQueryClient();
  
  const addUserMutation = useMutation({
    mutationFn: async ({ email, password, userRole }: AddUserParams) => {
      // First check if the user already exists in app_users
      const { data: existingAppUser, error: appUserError } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();
        
      if (!appUserError && existingAppUser) {
        throw new Error("Este usuario ya existe en el sistema");
      }

      try {
        // Use a temporary user_id that will be updated later
        const tempUserId = '00000000-0000-0000-0000-000000000000';
        
        // Add the user to app_users with a temporary user_id
        const { error: insertError } = await supabase
          .from("app_users")
          .insert({
            email: email.toLowerCase(),
            role: userRole,
            user_id: tempUserId
          });

        if (insertError) {
          console.error("Error inserting user in app_users:", insertError);
          throw insertError;
        }

        // Try to create the auth user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          if (!error.message.includes("User already registered")) {
            throw error;
          }
        }
        
        // Invalidate queries to force a refresh
        queryClient.invalidateQueries({ queryKey: ["app-users"] });
        
        return { message: "Usuario añadido. Estado: Pendiente de confirmación." };
      } catch (error: any) {
        console.error("Error in registration process:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if ('message' in data) {
        toast.success(data.message);
      } else {
        toast.success("Usuario añadido correctamente. Se ha enviado un correo de verificación.");
      }
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error: any) => {
      toast.error("Error al añadir usuario: " + error.message);
    },
  });

  return { addUserMutation };
};
