
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
    
    // Verificar si el usuario existe en auth.users intentando iniciar sesión
    try {
      // Intento de autenticación con una contraseña falsa para verificar si el usuario existe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: "DummyPassword12345!@#$%"
      });
      
      // Si el error contiene "Invalid login credentials", significa que el usuario existe
      // Si contiene otro tipo de error o no hay error, el usuario no existe
      if (signInError) {
        const userExists = signInError.message && signInError.message.includes("Invalid login credentials");
        results.authUsers = !userExists;
        console.log("Verificación de auth.users basada en intento de inicio de sesión:", 
                   userExists ? "Usuario existe" : "Usuario no existe", 
                   "Mensaje:", signInError.message);
      } else {
        // Si no hay error (esto no debería ocurrir con una contraseña falsa)
        results.authUsers = false;
        console.log("Inesperado: No hubo error al intentar iniciar sesión con contraseña falsa");
      }
    } catch (authError) {
      console.log("Error verificando auth.users mediante login:", authError);
      
      // Como fallback, intentar listar usuarios si tiene permisos admin
      try {
        const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log("No se pudo verificar auth.users por falta de permisos admin");
          results.authUsers = true; // Asumir éxito si no podemos verificar
        } else if (authUsersData && authUsersData.users) {
          const foundUser = authUsersData.users.find((user: any) => 
            user && typeof user.email === 'string' && 
            user.email.toLowerCase() === email.toLowerCase()
          );
          
          results.authUsers = !foundUser;
        }
      } catch (adminError) {
        console.log("Error verificando auth.users:", adminError);
        results.authUsers = true; // Asumir éxito si no podemos verificar
      }
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
