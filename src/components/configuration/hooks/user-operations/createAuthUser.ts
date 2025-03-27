
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserPermissions";

export type CreateAuthUserParams = {
  email: string;
  password: string;
  userRole: UserRole;
};

/**
 * Creates a new user in Supabase Auth
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
    
    // Special handling for already registered users
    if (error.message.includes("User already registered")) {
      console.log("User already exists in auth, continuing with app_user creation");
      return { userId: null, userExists: true };
    } else {
      throw error;
    }
  }
  
  console.log("Auth user created successfully:", data);
  return { userId: data?.user?.id || null, userExists: false };
};
