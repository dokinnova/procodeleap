
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user already exists in the app_users table
 */
export const checkExistingUser = async (email: string): Promise<boolean> => {
  // Check if the user already exists in app_users
  const { data: existingAppUser, error: appUserError } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
    
  if (!appUserError && existingAppUser) {
    return true;
  }
  
  return false;
};
