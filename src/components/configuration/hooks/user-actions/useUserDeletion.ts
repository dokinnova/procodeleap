
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { findUserByEmail } from "../user-operations/findUserByEmail";

export const useUserDeletion = () => {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log("Iniciando proceso de eliminación para usuario:", userId);
        
        // Si se proporciona un email en lugar de ID, intentar buscar el ID primero
        if (userId.includes('@')) {
          console.log("Se proporcionó un email en lugar de ID:", userId);
          const email = userId;
          const foundUserId = await findUserByEmail(email);
          
          if (foundUserId) {
            console.log("Usuario encontrado por email. ID:", foundUserId);
            userId = foundUserId;
          } else {
            console.log("No se encontró usuario con email:", email);
            
            // Buscar directamente en app_users por email
            const { data: appUsersByEmail, error: emailLookupError } = await supabase
              .from("app_users")
              .select("*")
              .eq("email", email.toLowerCase());
              
            if (emailLookupError) {
              console.error("Error buscando usuario por email:", emailLookupError);
            } else if (appUsersByEmail && appUsersByEmail.length > 0) {
              console.log("Usuarios encontrados por email en app_users:", appUsersByEmail.length);
              
              // Eliminar todos los usuarios con este email
              for (const user of appUsersByEmail) {
                console.log("Eliminando usuario con email:", email, "y app_user ID:", user.id);
                await deleteAppUserCompletely(user.id, user.user_id);
              }
              
              return email; // Devolver el email para indicar que se completó
            } else {
              console.log("No se encontraron usuarios con email:", email);
              throw new Error(`No se encontró ningún usuario con el email: ${email}`);
            }
          }
        }
        
        // Handle deletion differently based on whether it's a temporary user or real user
        if (userId === "00000000-0000-0000-0000-000000000000") {
          // For temporary users, we need to handle multiple potential matches
          console.log("Procesando eliminación de usuario temporal");
          
          // For users with the temporary ID, use a different approach
          // Get the app_users records for the temporary user
          const { data: userData, error: userError } = await supabase
            .from("app_users")
            .select("id, email")
            .eq("user_id", userId);
            
          if (userError) {
            console.error("Error obteniendo datos del usuario temporal:", userError);
            throw userError;
          }
          
          if (!userData || userData.length === 0) {
            throw new Error("No se encontró el usuario para eliminar");
          }
          
          console.log("Usuarios temporales encontrados:", userData.length);
          
          // Process each temporary user one by one
          for (const user of userData) {
            const appUserId = user.id;
            console.log("Procesando usuario temporal con ID:", appUserId, "y email:", user.email);
            await deleteAppUserCompletely(appUserId, userId);
          }
          
          return userId;
        } else {
          // For regular users with a real ID
          console.log("Procesando eliminación de usuario regular con ID:", userId);
          
          // Get the app_user ID from the auth user ID
          const { data: appUserData, error: appUserError } = await supabase
            .from("app_users")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
            
          if (appUserError) {
            console.error("Error obteniendo el app_user_id:", appUserError);
            throw new Error("Error identificando el usuario: " + appUserError.message);
          }
          
          if (!appUserData) {
            console.log("No se encontró app_user con user_id:", userId);
            
            // Intentar eliminar el usuario de auth de todos modos
            try {
              const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
              if (authDeleteError) {
                console.error("Error al eliminar usuario de auth:", authDeleteError);
              } else {
                console.log("Usuario eliminado de auth exitosamente");
              }
            } catch (authError) {
              console.error("Error al intentar eliminar usuario de auth:", authError);
            }
            
            return userId;
          }
          
          const appUserId = appUserData.id;
          console.log("ID de app_user a eliminar:", appUserId);
          
          await deleteAppUserCompletely(appUserId, userId);
          
          console.log("Usuario eliminado exitosamente:", userId);
          return userId;
        }
      } catch (error: any) {
        console.error("Error durante el proceso de eliminación del usuario:", error);
        throw error;
      }
    },
    onSuccess: (deletedId) => {
      toast.success(`Usuario ${deletedId.includes('@') ? deletedId : ''} eliminado correctamente`);
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error: any) => {
      toast.error("Error al eliminar usuario: " + error.message);
    },
  });

  // Función auxiliar para eliminar completamente un usuario de app_users y sus relaciones
  const deleteAppUserCompletely = async (appUserId: string, authUserId: string) => {
    // 1. Liberar tareas asignadas a este usuario
    try {
      const { data: tasksData, error: tasksQueryError } = await supabase
        .from("tasks")
        .select("id")
        .eq("assigned_user_id", appUserId);
        
      if (tasksQueryError) {
        console.error("Error verificando tareas del usuario:", tasksQueryError);
        throw new Error("Error verificando tareas del usuario: " + tasksQueryError.message);
      }
      
      if (tasksData && tasksData.length > 0) {
        console.log(`Desasignando ${tasksData.length} tareas del usuario antes de eliminarlo`);
        
        const { error: tasksUpdateError } = await supabase
          .from("tasks")
          .update({ assigned_user_id: null })
          .eq("assigned_user_id", appUserId);
          
        if (tasksUpdateError) {
          console.error("Error al desasignar tareas:", tasksUpdateError);
          throw new Error("Error al liberar tareas asignadas: " + tasksUpdateError.message);
        }
        
        console.log("Tareas desasignadas exitosamente");
      } else {
        console.log("No hay tareas asignadas a este usuario");
      }
    } catch (tasksError) {
      console.error("Error procesando tareas:", tasksError);
      // Continuar con el proceso aunque haya error en las tareas
    }
    
    // 2. Eliminar el usuario de app_users
    try {
      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("id", appUserId);
        
      if (error) {
        console.error("Error eliminando usuario de app_users:", error);
        throw error;
      }
      
      console.log("Usuario eliminado de app_users exitosamente:", appUserId);
    } catch (deleteError) {
      console.error("Error eliminando app_user:", deleteError);
      throw deleteError;
    }
    
    // 3. Intentar eliminar el usuario de auth.users si tiene ID válido
    if (authUserId && authUserId !== "00000000-0000-0000-0000-000000000000") {
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUserId);
        if (authDeleteError) {
          console.error("Error al eliminar usuario de auth:", authDeleteError);
          console.log("El usuario fue eliminado de app_users pero no de auth.users");
        } else {
          console.log("Usuario eliminado de auth.users exitosamente:", authUserId);
        }
      } catch (authError) {
        console.error("Error al intentar eliminar usuario de auth:", authError);
        console.log("El usuario fue eliminado de app_users pero no de auth.users");
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  return {
    handleDeleteUser,
    deleteByEmail: (email: string) => deleteUserMutation.mutate(email)
  };
};
