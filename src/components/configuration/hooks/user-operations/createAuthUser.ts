
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
  
  // Directly try to create the user without checking first
  try {
    // Attempt to register the user directly
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
      
      // If the user already exists, we need to handle this case differently
      if (error.message.includes("User already registered")) {
        console.log("User already exists in auth. Attempting admin user update...");
        
        try {
          // Use admin API to update user (requires service role, might not work with anon key)
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            "00000000-0000-0000-0000-000000000000", // This is a placeholder, we need to find the real ID
            { password }
          );
          
          if (updateError) {
            console.error("Failed to update user password:", updateError);
            
            // Fallback: Send password reset email
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
              normalizedEmail,
              {
                redirectTo: `${window.location.origin}/reset-password`,
              }
            );
            
            if (resetError) {
              console.error("Could not send password reset email:", resetError.message);
              throw resetError;
            } else {
              console.log("Password reset email sent successfully");
              toast.success(`Se ha enviado un email de restablecimiento de contraseña a ${normalizedEmail}`);
            }
          }
        } catch (adminError) {
          console.error("Admin API error:", adminError);
          throw adminError;
        }
        
        // Return null for userId to indicate we need to find it
        return { userId: null, userExists: true };
      } else {
        // This is an error other than "User already registered"
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
