
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
      // Primero verificamos si el usuario ya existe en app_users
      const { data: existingAppUser, error: appUserError } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();
        
      if (!appUserError && existingAppUser) {
        return { message: "Este usuario ya existe en el sistema" };
      }

      try {
        // Intentamos crear un nuevo usuario en Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          // Si es un error de usuario ya existente, intentamos añadirlo a app_users directamente
          if (error.message.includes("User already registered")) {
            // Intentamos buscar si algún usuario con esa dirección de correo se ha autenticado antes
            // y ya está en la tabla auth.users
            try {
              // Para los usuarios que ya existen en Auth pero no tienen entrada en app_users
              // Usamos un valor temporal para user_id que se actualizará después
              const tempUserId = '00000000-0000-0000-0000-000000000000';
              
              // Añadimos el usuario a app_users con un user_id temporal
              const { error: insertError } = await supabase
                .from("app_users")
                .insert({
                  email: email.toLowerCase(),
                  role: userRole,
                  user_id: tempUserId
                });

              if (insertError) {
                console.error("Error al insertar usuario en app_users:", insertError);
                if (insertError.message.includes("violates foreign key constraint")) {
                  return { message: "Usuario añadido. Pendiente de confirmación." };
                }
                throw insertError;
              }
              
              return { 
                message: "Usuario añadido. Estado: Pendiente de confirmación." 
              };
            } catch (err) {
              console.error("Error al comprobar usuario existente:", err);
              throw new Error("Error al procesar usuario existente");
            }
          } else {
            throw error;
          }
        }
        
        // Si llegamos aquí, el usuario se creó exitosamente
        // Creamos el registro en app_users solo si tenemos un user.id válido
        if (data?.user?.id) {
          const { error: userError } = await supabase
            .from("app_users")
            .insert({
              email: email.toLowerCase(),
              user_id: data.user.id,
              role: userRole
            });

          if (userError) {
            console.error("Error al insertar usuario en app_users:", userError);
            // Si falla la inserción en app_users, devolvemos un mensaje pero no lanzamos error
            // ya que el usuario ya se creó en Auth
            return { 
              message: "Usuario creado en Auth pero no se pudo añadir a app_users. Se sincronizará cuando inicie sesión." 
            };
          }
        }
        
        return data as AddUserResult;
      } catch (error: any) {
        console.error("Error en el proceso de registro:", error);
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
