
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
  
  const normalizedEmail = email.trim().toLowerCase();
  
  console.log("Creating auth user with email:", normalizedEmail);
  console.log("Password length:", password?.length || 0);
  console.log("Password first character (for debugging):", password?.[0] || 'none');
  
  // First, check if the user already exists in auth.users
  try {
    // Try to sign in to check if user exists (we don't actually sign in)
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: "This-Is-A-Fake-Password-1234567890"  // Use a fake password that will definitely fail
    });
    
    // If there's a specific error message about invalid credentials, 
    // the user exists but the password is wrong (as expected)
    const userExistsInAuth = checkError && 
      checkError.message && 
      checkError.message.includes("Invalid login credentials");
    
    if (userExistsInAuth) {
      console.log("User exists in auth system. Attempting admin password reset...");
      
      // Since the user exists in auth but we can't directly update the password with admin API,
      // we'll try to use the password reset flow to allow them to set a new password
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );
        
        if (resetError) {
          console.log("Could not send password reset email:", resetError.message);
        } else {
          console.log("Password reset email sent successfully");
          toast.success(`Se ha enviado un email de restablecimiento de contraseña a ${normalizedEmail}`);
        }
      } catch (resetError) {
        console.log("Error sending password reset:", resetError);
      }
      
      // Return null for userId to indicate we need to find it
      return { userId: null, userExists: true };
    }
    
    // If we got here, the user doesn't exist in auth, so create them
    console.log("User doesn't exist in auth system. Creating new user...");
    
    // Attempt to register the user
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
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
