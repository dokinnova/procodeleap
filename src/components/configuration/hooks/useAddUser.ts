
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

        console.log("User created successfully, sending welcome email");
        
        // Send welcome email
        try {
          // Get current auth session for API call
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            console.warn("No active session found for API call. Will try admin call");
          }
          
          console.log("Calling send-mass-email function...");
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-mass-email', {
            body: {
              recipients: [{ email, name: email.split('@')[0] }],
              subject: 'Bienvenido a PROCODELI',
              content: `
                <div>
                  <h2>¡Bienvenido a PROCODELI!</h2>
                  <p>Tu cuenta ha sido creada exitosamente con el rol de ${
                    userRole === 'admin' ? 'administrador' : 
                    userRole === 'editor' ? 'editor' : 
                    'visualizador'
                  }.</p>
                  <p>Ya puedes acceder al sistema usando tu email y contraseña.</p>
                  <p>Si tienes alguna pregunta, no dudes en contactar con el administrador del sistema.</p>
                </div>
              `
            },
            // Explicitly specify method
            method: 'POST'
          });

          if (emailError) {
            console.error("Error sending welcome email:", emailError);
            console.error("Full error object:", JSON.stringify(emailError));
            throw new Error(`Error en el envío del email: ${JSON.stringify(emailError)}`);
          }

          console.log("Welcome email sent successfully:", emailData);
        } catch (emailErr: any) {
          console.error("Error sending welcome email:", emailErr);
          console.error("Full error object:", JSON.stringify(emailErr));
          // Don't throw here, as the user creation was successful
          toast.error(`No se pudo enviar el email de bienvenida: ${emailErr.message || 'Error desconocido'}`);
        }
        
        // Invalidate queries to force a refresh
        queryClient.invalidateQueries({ queryKey: ["app-users"] });
        
        return { message: "Usuario añadido. Se ha enviado un email de bienvenida." };
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
