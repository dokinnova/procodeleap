
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

export type AppUser = Database['public']['Tables']['app_users']['Row'];
export type AuthUserInfo = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
};

export const syncUsers = async (
  setIsSyncing: (isSyncing: boolean) => void,
  setAuthUsers: (authUsers: Record<string, AuthUserInfo>) => void,
  queryClient: QueryClient
): Promise<void> => {
  setIsSyncing(true);
  try {
    // Primero obtenemos todos los usuarios de app_users
    const { data: existingAppUsers, error } = await supabase
      .from("app_users")
      .select("*");
    
    if (error) throw error;
    
    // Creamos un conjunto de emails para búsqueda rápida
    const existingEmails = new Set();
    if (existingAppUsers) {
      existingAppUsers.forEach(user => {
        if (user.email) {
          existingEmails.add(user.email.toLowerCase());
        }
      });
    }
    
    // Comprobamos si hay un usuario actualmente autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const currentUser = session.user;
      
      // Verificamos si el usuario actual ya está en app_users
      if (currentUser.email && !existingEmails.has(currentUser.email.toLowerCase())) {
        console.log("Añadiendo usuario actual a app_users:", currentUser.email);
        
        const { error: insertError } = await supabase
          .from("app_users")
          .insert({
            email: currentUser.email,
            user_id: currentUser.id,
            role: 'admin' // El primer usuario que se añade es admin
          });
          
        if (insertError) {
          console.error("Error al insertar usuario actual:", insertError);
          toast.error("Error al sincronizar el usuario actual");
        } else {
          toast.success("Usuario actual sincronizado correctamente");
        }
      } else {
        // Buscamos usuarios con email igual al actual pero con user_id temporal
        const { data: tempUsers } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", currentUser.email.toLowerCase())
          .eq("user_id", "00000000-0000-0000-0000-000000000000");

        if (tempUsers && tempUsers.length > 0) {
          // Actualizamos el user_id temporal con el actual
          const { error: updateError } = await supabase
            .from("app_users")
            .update({ user_id: currentUser.id })
            .eq("email", currentUser.email.toLowerCase())
            .eq("user_id", "00000000-0000-0000-0000-000000000000");

          if (updateError) {
            console.error("Error al actualizar user_id temporal:", updateError);
            toast.error("Error al actualizar sincronización de usuario");
          } else {
            toast.success("Usuario sincronizado correctamente");
          }
        }
      }
    }

    // Sincronizar registros existentes que tengan email pero con user_id temporal
    if (existingAppUsers) {
      const incompleteUsers = existingAppUsers.filter(user => 
        user.user_id === "00000000-0000-0000-0000-000000000000" && user.email);
      
      if (incompleteUsers.length > 0) {
        toast.info(`Hay ${incompleteUsers.length} usuarios pendientes de sincronización.`);
      }
    }

    // Intentamos obtener información adicional de auth.users a través de la API de Supabase
    try {
      // Esta consulta solo funcionará si el usuario tiene permisos de administrador
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsersData && authUsersData.users) {
        const userMap: Record<string, AuthUserInfo> = {};
        
        // Usando type assertion para definir el tipo correcto
        const users = authUsersData.users as Array<{
          id: string;
          email: string | null;
          last_sign_in_at: string | null;
          created_at: string;
        }>;
        
        users.forEach(user => {
          if (user && user.id) {
            userMap[user.id] = {
              id: user.id,
              email: user.email || '',
              last_sign_in_at: user.last_sign_in_at,
              created_at: user.created_at
            };
          }
        });
        setAuthUsers(userMap);
      }
    } catch (authError) {
      console.warn("No se pudo acceder a la información de auth.users:", authError);
      // Esto es normal si el usuario no tiene permisos de administrador
    }

    // Refrescar la consulta para mostrar los cambios
    queryClient.invalidateQueries({ queryKey: ["app-users"] });
    toast.success("Sincronización completada");
  } catch (error: any) {
    console.error("Error general al sincronizar usuarios:", error);
    toast.error("Error al sincronizar usuarios: " + error.message);
  } finally {
    setIsSyncing(false);
  }
};
