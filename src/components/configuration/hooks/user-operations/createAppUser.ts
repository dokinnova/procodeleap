
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserPermissions";
import { findUserByEmail } from "./findUserByEmail";

export type CreateAppUserParams = {
  email: string;
  userRole: UserRole;
  userId: string | null;
};

/**
 * Creates or updates a user in the app_users table
 */
export const createAppUser = async ({ email, userRole, userId }: CreateAppUserParams) => {
  // If we don't have a userId, try to find it or use a temporary ID
  let actualUserId = userId;
  
  if (!actualUserId) {
    // Try to find the user ID by email
    actualUserId = await findUserByEmail(email);
    
    // If still not found, use a temporary ID
    if (!actualUserId) {
      actualUserId = '00000000-0000-0000-0000-000000000000';
    }
  }
  
  // Add the user to app_users
  console.log("Adding user to app_users with ID:", actualUserId);
  const { error: insertError } = await supabase
    .from("app_users")
    .insert({
      email: email.toLowerCase(),
      role: userRole,
      user_id: actualUserId
    });

  if (insertError) {
    console.error("Error inserting user in app_users:", insertError);
    throw insertError;
  }
  
  return { success: true };
};
