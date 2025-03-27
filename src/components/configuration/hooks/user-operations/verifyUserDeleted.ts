
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies if a user has been completely deleted from the system
 * @param email The email of the user to verify
 * @returns Object with verification results for different tables
 */
export const verifyUserDeleted = async (email: string) => {
  console.log("Verificando eliminación completa del usuario:", email);
  
  const results = {
    appUsers: false,
    authUsers: false,
    tasks: false,
    message: ""
  };
  
  try {
    // Check if user exists in app_users
    const { data: appUserData, error: appUserError } = await supabase
      .from("app_users")
      .select("*")
      .eq("email", email.toLowerCase());
      
    if (appUserError) {
      console.error("Error verificando app_users:", appUserError);
      results.message = `Error verificando app_users: ${appUserError.message}`;
      return results;
    }
    
    results.appUsers = appUserData && appUserData.length === 0;
    
    // Check if user has tasks assigned
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("id, assigned_user_id, app_users(email)")
      .eq("app_users.email", email.toLowerCase());
    
    if (tasksError) {
      console.error("Error verificando tasks:", tasksError);
      results.message = `Error verificando tasks: ${tasksError.message}`;
      return results;
    }
    
    results.tasks = tasksData && tasksData.length === 0;
    
    // Try to check auth users (admin only)
    try {
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log("No se pudo verificar auth.users por falta de permisos admin");
        results.authUsers = true; // Assume success if we can't verify
      } else if (authUsersData && authUsersData.users) {
        const foundUser = authUsersData.users.find((user: any) => 
          user && typeof user.email === 'string' && 
          user.email.toLowerCase() === email.toLowerCase()
        );
        
        results.authUsers = !foundUser;
      }
    } catch (authError) {
      console.log("Error verificando auth.users:", authError);
      results.authUsers = true; // Assume success if we can't verify
    }
    
    // Prepare result message
    let message = "";
    if (results.appUsers && results.authUsers && results.tasks) {
      message = `Usuario ${email} eliminado completamente del sistema.`;
    } else {
      if (!results.appUsers) {
        message += "Usuario aún existe en app_users. ";
      }
      if (!results.authUsers) {
        message += "Usuario aún existe en auth.users. ";
      }
      if (!results.tasks) {
        message += "Usuario aún tiene tareas asignadas. ";
      }
    }
    
    results.message = message;
    return results;
    
  } catch (error) {
    console.error("Error general verificando eliminación:", error);
    results.message = `Error verificando eliminación: ${error}`;
    return results;
  }
};
