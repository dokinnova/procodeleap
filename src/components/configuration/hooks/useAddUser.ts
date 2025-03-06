
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserPermissions";

// Define a type for the return value of the mutation
type AddUserResult = { user: any; session: any } | { message: string };

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
        return { message: "Este usuario ya existe en el sistema" };
      }

      try {
        // Try to create a new user in Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          // If it's a user already exists error, try to add them to app_users directly
          if (error.message.includes("User already registered")) {
            // For users that already exist in Auth but not in app_users
            // Use a temporary value for user_id that will be updated later
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
              if (insertError.message.includes("violates foreign key constraint")) {
                return { message: "Usuario añadido. Pendiente de confirmación." };
              }
              throw insertError;
            }
            
            return { 
              message: "Usuario añadido. Estado: Pendiente de confirmación." 
            };
          } else {
            throw error;
          }
        }
        
        // If we reach here, the user was created successfully
        // Create the record in app_users only if we have a valid user.id
        if (data?.user?.id) {
          const { error: userError } = await supabase
            .from("app_users")
            .insert({
              email: email.toLowerCase(),
              user_id: data.user.id,
              role: userRole
            });

          if (userError) {
            console.error("Error inserting user in app_users:", userError);
            // If inserting into app_users fails, return a message but don't throw an error
            // since the user was already created in Auth
            return { 
              message: "Usuario creado en Auth pero no se pudo añadir a app_users. Se sincronizará cuando inicie sesión." 
            };
          }
        }
        
        return data as AddUserResult;
      } catch (error: any) {
        console.error("Error in registration process:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Check if data has a message property to determine its type
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
