
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserPermissions";

export type CreateAuthUserParams = {
  email: string;
  password: string;
  userRole: UserRole;
};

/**
 * Creates a new user in Supabase Auth or gets an existing user
 */
export const createAuthUser = async ({ email, password, userRole }: CreateAuthUserParams) => {
  // Validate password
  if (!password || password.length < 6) {
    console.error("Error de validación: La contraseña debe tener al menos 6 caracteres");
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  
  console.log("Creating auth user with email:", email);
  console.log("Password length:", password?.length || 0);
  console.log("Password first character (for debugging):", password?.[0] || 'none');
  
  // First, check if the user already exists in auth.users
  try {
    // Try to sign in to check if user exists (we don't actually sign in)
    const { data: checkData, error: checkError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: "This-Is-A-Fake-Password-1234567890"  // Use a fake password that will definitely fail
    });
    
    // If there's a specific error message about invalid credentials, 
    // the user exists but the password is wrong (as expected)
    const userExistsInAuth = checkError && 
      checkError.message && 
      checkError.message.includes("Invalid login credentials");
    
    if (userExistsInAuth) {
      console.log("User exists in auth system. Attempting to get user ID...");
      
      // Try to update user password if needed
      try {
        // Attempt to update the user password using admin functions
        // This will only work if you have admin privileges
        const { data: adminData, error: adminError } = await supabase.auth.admin.updateUserById(
          email, // We don't know the ID yet, but try with email
          { password: password }
        );
        
        if (adminError) {
          console.log("Could not update password via admin API:", adminError.message);
          // Continue anyway - we'll create the app_user entry
        } else {
          console.log("Password updated successfully for existing user");
        }
      } catch (updateError) {
        console.log("Error updating password:", updateError);
        // Continue anyway - we'll create the app_user entry
      }
      
      // Return null for userId to indicate we need to find it
      return { userId: null, userExists: true };
    }
    
    // If we got here, the user doesn't exist in auth, so create them
    console.log("User doesn't exist in auth system. Creating new user...");
    
    // Attempt to register the user
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
      console.error("Full error details:", JSON.stringify(error));
      
      // Double-check if the user already exists
      if (error.message.includes("User already registered")) {
        console.log("User already exists in auth, continuing with app_user creation");
        return { userId: null, userExists: true };
      } else {
        throw error;
      }
    }
    
    console.log("Auth user created successfully:", data);
    return { userId: data?.user?.id || null, userExists: false };
  } catch (err) {
    console.error("Unexpected error in createAuthUser:", err);
    throw err;
  }
};
