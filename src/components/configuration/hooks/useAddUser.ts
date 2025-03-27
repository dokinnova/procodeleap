
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
        // Create the auth user first
        console.log("Creating auth user with email:", email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              role: userRole // Store role in user metadata
            }
          }
        });

        if (error) {
          console.error("Error creating auth user:", error);
          
          // Special handling for already registered users
          if (error.message.includes("User already registered")) {
            console.log("User already exists in auth, continuing with app_user creation");
          } else {
            throw error;
          }
        } else {
          console.log("Auth user created successfully:", data);
        }
        
        // Get the user ID from the response or try to find it
        let userId;
        if (data?.user?.id) {
          userId = data.user.id;
        } else {
          // If we didn't get a user ID back (e.g., user already exists), try to find it
          // Since getUserByEmail doesn't exist, we'll need to query the users table
          const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
            filter: {
              email: email
            }
          });
          
          if (listError || !authUsers || !authUsers.users || authUsers.users.length === 0) {
            console.error("Error finding user by email:", listError || "No users found");
            // Just continue with a temporary ID, it will be updated later
            userId = '00000000-0000-0000-0000-000000000000';
          } else {
            // Find the user with the matching email
            const foundUser = authUsers.users.find(u => u.email === email);
            userId = foundUser ? foundUser.id : '00000000-0000-0000-0000-000000000000';
            console.log("Found user ID:", userId, "for email:", email);
          }
        }

        // Add the user to app_users
        console.log("Adding user to app_users with ID:", userId);
        const { error: insertError } = await supabase
          .from("app_users")
          .insert({
            email: email.toLowerCase(),
            role: userRole,
            user_id: userId
          });

        if (insertError) {
          console.error("Error inserting user in app_users:", insertError);
          throw insertError;
        }
        
        console.log("User created successfully, sending welcome email");
        
        // Send welcome email - with administrator rights
        const adminSessionResponse = await supabase.auth.getSession();
        if (!adminSessionResponse.data.session) {
          console.error("No admin session available for sending welcome email");
          toast.error("No se pudo enviar el email de bienvenida: No hay sesión activa");
          return { message: "Usuario añadido, pero no se pudo enviar el email de bienvenida." };
        }
        
        try {
          console.log("Using admin session for sending email");
          
          const response = await supabase.functions.invoke('send-mass-email', {
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
            method: 'POST'
          });

          const { data: emailData, error: emailError } = response;

          console.log("Email function response:", response);

          if (emailError) {
            console.error("Error sending welcome email:", emailError);
            console.error("Full error object:", JSON.stringify(emailError));
            throw new Error(`Error en el envío del email: ${JSON.stringify(emailError)}`);
          }

          console.log("Welcome email function response:", emailData);
          
          // If there's a specific error message about domain validation
          if (emailData?.error?.includes("Resend sólo permite enviar emails al propietario")) {
            toast.warning(emailData.error);
            return { message: "Usuario añadido. " + emailData.error };
          }
          
          // Check for errors in email results
          if (emailData?.results?.[0]?.error) {
            const errorMsg = typeof emailData.results[0].error === 'string' 
              ? emailData.results[0].error
              : JSON.stringify(emailData.results[0].error);
            console.warn("Email error from results:", errorMsg);
            toast.warning(`Usuario añadido pero hubo un problema con el email: ${errorMsg}`);
            return { message: `Usuario añadido. Error en el envío del email: ${errorMsg}` };
          }
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
